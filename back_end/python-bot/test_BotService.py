import pytest
import re
import json
from BotService import *

def getConfig():
	with open("./service_config.json","r") as f:
		return json.load(f)

class parentCommentDummy():

	def __init__(self,body):
		self.body = body

class parentPostDummy():

	def __init__(self,title,selftext):
		self.title = title
		self.selftext = selftext

class commentDummy():

	def __init__(self,body,parent=None):
		self.body = body
		self._parent = parent
		self.id = "F#&!"

	def parent(self):
		return self._parent

	def reply(self,data):
		pass

'''
Testing BotService parent class
'''
def test_configureInvokerQuery():
	setting = getConfig()[1]
	for case in ["   ","test1","test 1 2 3 4 5"]:
		for invoker in ["{{ }}","< >"]:
			setting['invocation']['query'] = invoker
			service = BotService(setting,testing=True)
			if '[' in invoker:
				invoker = re.sub(r'\[',r'\\\[',invoker)
				invoker = re.sub(r'\]',r'\\\]',invoker)
			sides = invoker.split(' ')
			teststring = "!fandom%s%s%s" % (sides[0],case,sides[1])
			print(teststring)
			assert(re.match(service.pattern,teststring).group(1) == case)

def test_configureInvokerSymbol():
	setting = getConfig()[1]
	for case in ["    ","test1","test 1 2 3 4 5"]:
		for symbol in ["?","$","!"]:
			if symbol != "!":
				setting['invocation']['symbol'] = "\\" + symbol
			else:
				setting["invocation"]["symbol"] = symbol
			service = BotService(setting,testing=True)
			sides = setting["invocation"]["query"].split(' ')
			teststring = symbol + "fandom%s%s%s" % (sides[0],case,sides[1])
			print(teststring)
			print(service.pattern.pattern)
			assert(re.match(service.pattern,teststring).group(1) == case)


def test_configureInvokerTerm():
	setting = getConfig()[1]
	for case in ["   ","test1","test 1 2 3 4 5"]:
		for term in ["dwight", "fandomsearch","bankruptcy"]:
			setting['invocation']['term'] = term
			service = BotService(setting,testing=True)
			sides = setting["invocation"]["query"].split(' ')
			teststring = setting["invocation"]["symbol"] + term+"%s%s%s" % (sides[0],case,sides[1])
			print(teststring)
			print(service.pattern.pattern)
			assert(re.match(service.pattern,teststring).group(1) == case)



'''
Testing Fandom Service
'''
def test_getSearchResult():
	setting = getConfig()[1]
	service = FandomService(setting,testing=True)
	cases = {
			 "andy" : "https://theoffice.fandom.com/wiki/Andy_Bernard", 
			 "dwight" : "https://theoffice.fandom.com/wiki/Dwight_Schrute",
			}
	for case, answer in cases.items():
		assert(service.getSearchResult(case) == answer)


def test_getArticleId():
	setting = getConfig()[1]
	service = FandomService(setting,testing=True)
	cases = {
			 "https://theoffice.fandom.com/wiki/Dunder_Mifflin_Scranton":"1657",
			 "https://theoffice.fandom.com/wiki/Scott%27s_Tots" : "3185"
			 }
	for case, answer in cases.items():
		assert(service.getArticleId(case) == answer)


def test_getImageUrl():
	setting = getConfig()[1]
	service = FandomService(setting,testing=True)
	cases = {
			 "https://theoffice.fandom.com/wiki/Schrute_Farms" : "https://vignette.wikia.nocookie.net/theoffice/images/d/da/Shrute_Farms.jpg/revision/latest?cb=20120102024338",
			 "https://theoffice.fandom.com/wiki/Jim_Halpert" : "https://vignette.wikia.nocookie.net/theoffice/images/e/e9/Character_-_JimHalpert.PNG/revision/latest?cb=20200414162003",
			 "https://theoffice.fandom.com/wiki/Pam_Beesly" : "https://vignette.wikia.nocookie.net/theoffice/images/6/67/Pam_Beesley.jpg/revision/latest?cb=20170701084358"
			}

	for case, answer in cases.items():
		print(answer)
		print(service.getImageUrl(case))
		assert(service.getImageUrl(case) == answer)


def test_getPageContent():
	setting = getConfig()[1]
	service = FandomService(setting,testing=True)
	cases = {"1657":"Dunder Mifflin Scranton","3185":"Scott's Tots"}
	for case, answer in cases.items():
		title,content = service.getPageContent(case)
		print(title)
		assert(title==answer)


def test_runFandomService():
	setting = getConfig()[1]
	service = FandomService(setting,testing=True)

	commentBodies = [commentDummy(i) for i in ["no request","!fandom<>","!fandom<dwight>"]]
	solutions = [0,-1,1]

	for case,sol in zip(commentBodies,solutions):
		assert(service.run(case) == sol)



'''
Testing Translate Service
'''

def test_translate():
	setting = getConfig()[0]
	service = TranslateService(setting,testing=True)
	newtext = ["cómo estás","how are you"]
	parents = [parentPostDummy("title","how are you"),parentCommentDummy("como estas")]
	newlang = [None,"en"]

	for i in range(2):
		result = service.translate(parents[i],dest=newlang[i])
		assert(result.text == newtext[i])
		if i == 0:
			assert(result.dest == 'es')
		else:
			assert(result.dest == newlang[i])

def test_runTranslateService():
	setting = getConfig()[0]
	service = TranslateService(setting,testing=True)

	commentBodies = ["!translate{{klingon}}","!translate{{french}}"]
	commentParents = [parentPostDummy("title","next is spanish"),parentCommentDummy("next is french")]
	solution = [-1,1]

	for i in range(2):
		comment = commentDummy(commentBodies[i],parent=commentParents[i])
		val = service.run(comment)
		assert(val == solution[i])





