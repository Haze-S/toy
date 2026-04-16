import discord
from discord.ext import commands, tasks
from datetime import datetime, time, timezone, timedelta
import os
from dotenv import load_dotenv

# .env 파일에서 환경변수 불러오기
load_dotenv()

# 1. 설정 부분
TOKEN = os.getenv('TOKEN')
RUDRA_CHANNEL_ID_1 = int(os.getenv('RUDRA_CHANNEL_ID_1'))
RUDRA_CHANNEL_ID_2 = int(os.getenv('RUDRA_CHANNEL_ID_2'))
CHIMSIK_CHANNEL_ID_1 = int(os.getenv('CHIMSIK_CHANNEL_ID_1'))
CHIMSIK_CHANNEL_ID_2 = int(os.getenv('CHIMSIK_CHANNEL_ID_2'))

# 고정 시간(평일 23:30 / 주말 22:00)으로 진행되는 채널
FIXED_TIME_CHANNELS = {RUDRA_CHANNEL_ID_2, CHIMSIK_CHANNEL_ID_1}

# 한국 시간(KST) 설정을 위한 오프셋 (UTC+9)
KST = timezone(timedelta(hours=9))

class MyBot(commands.Bot):
    def __init__(self):
        intents = discord.Intents.default()
        intents.message_content = True  # 메시지 내용을 읽기 위해 필수
        super().__init__(command_prefix="!", intents=intents)

    async def setup_hook(self):
        # 봇이 시작될 때 주기적 투표 스케줄러 시작
        self.weekly_poll_task.start()

    # 봇 로그인 성공 시 터미널에 알림
    async def on_ready(self):
        print(f'✅ 로그인 성공: {self.user.name}')

    # 매일 오전 09:00 KST에 실행 체크
    @tasks.loop(time=time(hour=9, minute=0, tzinfo=KST))
    async def weekly_poll_task(self):
        now = datetime.now(KST)
        
        # 화요일(weekday == 1)일 때만 실행
        if now.weekday() == 1:
            await self.send_scheduled_poll()

    async def send_scheduled_poll(self):
        now = datetime.now(KST)
        target_channels = [RUDRA_CHANNEL_ID_1, RUDRA_CHANNEL_ID_2, CHIMSIK_CHANNEL_ID_1, CHIMSIK_CHANNEL_ID_2]

        # 이번 주 수요일 날짜 계산
        days_until_wed = (2 - now.weekday()) % 7
        wednesday = now + timedelta(days=days_until_wed)
        wednesday_str = wednesday.strftime("%m/%d")

        # 수요일 밤 8시(KST) 종료 시각 계산
        poll_end = datetime(
            year=wednesday.year,
            month=wednesday.month,
            day=wednesday.day,
            hour=20, minute=0, second=0, tzinfo=KST
        )
        # 현재 시각(now)부터 종료 시각까지 남은 시간
        duration = poll_end - now
        # 만약 이미 종료 시간이 지났으면 최소 1분 유지
        if duration.total_seconds() <= 0:
            duration = timedelta(minutes=1)

        for c_id in target_channels:
            channel = self.get_channel(c_id)
            if channel:
                # Poll 객체는 채널마다 새로 생성해야 함
                if c_id in FIXED_TIME_CHANNELS:
                    question = (
                        f"📅 점검 후 성역 참여 가능 요일 투표 (점검일: {wednesday_str})\n"
                        f"**고정 시간 : 평일 23:30, 주말 22:00**"
                    )
                else:
                    question = (
                        f"📅 점검 후 성역 참여 가능 요일 투표 (점검일: {wednesday_str})\n"
                        f"**고정 시간 : 평일 21:30, 주말 협의**"
                    )
                poll = discord.Poll(
                    question=question,
                    duration=duration,
                    multiple=True
                )

                days = ["수", "목", "금", "토", "일", "월", "화"]
                for day in days:
                    poll.add_answer(text=f"{day}요일")

                await channel.send("@here 🔔 이번 주 일정을 체크해 주세요!", poll=poll)
                print(f"🚀 채널({c_id})에 투표 전송 완료")

    @weekly_poll_task.before_loop
    async def before_poll(self):
        await self.wait_until_ready()

# 봇 인스턴스 생성
bot = MyBot()

# [테스트 명령어] 채팅창에 !테스트 입력 시 즉시 투표 발송
@bot.command(name="테스트")
async def test_poll(ctx):
    print("📢 테스트 명령어가 감지되었습니다.")
    await bot.send_scheduled_poll()
    await ctx.send("✅ 설정된 모든 채널에 테스트 투표를 발송했습니다.")

# 봇 실행
bot.run(TOKEN)