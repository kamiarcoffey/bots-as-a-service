from RedditBot import *
from BotService import *
import sys


if __name__ == '__main__':
	print(sys.argv[1])
	bot = RedditBot(sys.argv[1])
	bot.run()