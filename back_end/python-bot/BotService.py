import re
import requests
from collections import defaultdict
from bs4 import BeautifulSoup
import googletrans


class BotService():

	#initialize child-agnostic service parameters and data holders
	def __init__(self,service,testing=False):
		print("init base class")
		self.service_name = service['service_name']
		self.language = service['language']
		self.pattern = self.configureInvoker(service['invocation']['symbol'],service['invocation']['term'],service['invocation']['query'])
		self.testing = testing


	#compile regex to match
	def configureInvoker(self,symbol,keyphrase,invoker):
		invoker = re.sub(r"\[",r"\\\[",invoker)
		invoker = re.sub(r"\]",r"\\\]",invoker)
		invocation = invoker.split(' ')
		print("initializing invoker: %s" % (symbol + keyphrase + invocation[0] + "([a-zA-Z0-9 ]+)" + invocation[1]))
		return re.compile(symbol + keyphrase + invocation[0] + "([a-zA-Z0-9 ]*)" + invocation[1])


	#string serialization method
	def __str__(self):
		return "\n\tName: %s\n\tCall:%s\n" % (self.service_name,str(self.pattern.pattern))




class FandomService(BotService):

	#initialize child-specific service parameters, like URLs
	def __init__(self,service,testing=False):
		super().__init__(service)
		print("init child class")
		self.search_query = "Special:Search?query="
		self.pagedata_url = "api/v1/Articles/AsSimpleJson?id="
		self.base_url = service['params']['url']


	#main run loop for the service
	def run(self,comment):
		if self.testing:
			pass
		print("running service: \"%s\"" % self.service_name)
		if "[" in self.pattern.pattern:
			comment_text = comment.body.replace("\\","")
		else:
			comment_text = comment.body
		match = re.search(self.pattern,comment_text)
		if match:
			print("comment %s: \"%s...\" has requested service: \"%s\"" % (comment.id,comment.body[:15],self.service_name))
			if match.group(1).isspace() or not match.group(1):
				print("Search query is empty! Moving on.")
				print("----------------------")
				if not self.testing:
					self.postReply(comment,"It looks like you requested a fandom search, but there's no search terms provided.")
				return -1
			result = self.getSearchResult(match.group(1))
			page_id = self.getArticleId(result)
			title, summary = self.getPageContent(page_id)
			img_url = self.getImageUrl(result)
			markdown = self.markdown(title,summary,img_url)
			if not self.testing:
				self.postReply(comment,markdown)
			return 1

		else:
			print("comment %s: \"%s...\" is not requesting service: \"%s\"" % (comment.id,comment.body[:15],self.service_name))
			print("-----------------------")
			return 0
			
		# else:
		# 	print("comment %s: \"%s...\" has already been visited by: \"%s\"" % (comment.id,comment.body[:15],self.service_name))
		# 	print("-----------------------")
		# 	return 2
			

	#fetch query from Fandom
	def getSearchResult(self,query):
		full_url = self.base_url + self.search_query + query
		page = requests.get(full_url)
		soup = BeautifulSoup(page.content,'html.parser')
		return soup.find("li",{"class":"result"}).find('a')['href']
		
	#get the article ID for simple json page
	def getArticleId(self,result_url):
		page = requests.get(result_url)
		pagetext = page.content.decode("utf-8")
		page_id = re.search("\"pageArticleId\":([0-9]+)",pagetext)
		if page_id:
			return page_id.group(1)
		else:
			#error in the article id finder
			return -1

	#get simple json for current article
	def getPageContent(self,page_id):
		response = requests.get(self.base_url + self.pagedata_url + str(page_id))
		json_response = response.json()
		summary = json_response["sections"][0]
		summary_string = ""
		title = summary['title']
		for contents in summary['content']:
			if contents['type'] == 'paragraph':
				summary_string += contents['text']

		return title, summary_string

	#grab thumbnail image from the article page (thumbnail image not included in simple-page json)
	def getImageUrl(self,result_url):
		try:
			classes = re.compile("imagecell|pi-image-thumbnail")
			page = requests.get(result_url)
			soup = BeautifulSoup(page.content,'html.parser')
			oo = soup.find('a',{'class':"image-thumbnail"})["href"]#.find('a')['href']
			return oo
		except:
			return -1

	#format the comment
	def markdown(self,title,text,image_url):
		if image_url == -1:
			return '**%s**\n\n%s' % (title,text)
		return '[**%s**](%s)\n\n%s' % (title,image_url,text)

	#post it!
	def postReply(self,comment,markdown):
		comment.reply(markdown)

	#format data and pass it up to the RedditBot instance
	def feedDataOut(self):
		pass


class TranslateService(BotService):

	def __init__(self,service,testing=False):
		super().__init__(service)
		self.translator = googletrans.Translator()
		self.LANGUAGES = googletrans.LANGUAGES
		self.LANGCODES = googletrans.LANGCODES
		self.default = self.LANGCODES[service['params']['default_language'].lower()]
		

	def postReply(self,comment,response):
		comment.reply(response)

	def translate(self,parent,dest=None):
		if not dest:
			dest = self.default
		try:
			parent_text = parent.body
			result = self.translator.translate(parent_text,dest=dest)

		except:
			parent_title = parent.title
			parent_text = parent.selftext

			result = self.translator.translate(parent_text,dest=dest)

		return result



	def run(self,comment):
		print("running service: \"%s\"" % self.service_name)
		if "[" in self.pattern.pattern:
			comment_text = comment.body.replace("\\","")
		else:
			comment_text = comment.body
		match = re.search(self.pattern,comment_text)
		if match:
			print("comment %s: \"%s...\" has requested service: \"%s\"" % (comment.id,comment.body[:15],self.service_name))
			#condition for !translate[[]] and !translate[[ ]]
			if match.group(1).isspace() or not match.group(1):
				print("Search query is empty! Moving on.")
				print("----------------------")
				parent = comment.parent()
				result = self.translate(parent)
				response = "It looks like you requested a translation, but there's no destination language provided. Translating to %s by default:\n\n*Original (%s):*\n%s\n\n*Translation (%s):*\n%s" % (self.default,self.LANGUAGES[result.src],result.origin,self.LANGUAGES[result.dest],result.text)
				if not self.testing:
					self.postReply(comment,response)
				return -1

			#invalid language or language code
			elif not self.LANGUAGES.get(match.group(1)) and not self.LANGCODES.get(match.group(1)):
				print("Search query is invalid! Moving on.")
				print("----------------------")
				parent = comment.parent()
				result = self.translate(parent)
				response = "It looks like you requested a translation, but the provided language is not recognized. Translating to %s by default:\n\n*Original (%s):*\n%s\n\n*Translation (%s):*\n%s" % (self.default,self.LANGUAGES[result.src],result.origin,self.LANGUAGES[result.dest],result.text)
				if not self.testing:
					self.postReply(comment,response)
				return -1

			#issa match
			else:
				parent = comment.parent()
				if len(match.group(1)) == 2:
					result = self.translate(parent,dest=match.group(1))
				else:
					result = self.translate(parent,dest=self.LANGCODES[match.group(1)])
					response = "*Original (%s):*\n%s\n\n*Translation(%s):*\n%s" % (self.LANGUAGES[result.src],result.origin,self.LANGUAGES[result.dest],result.text)
					if not self.testing:
						self.postReply(comment,response)

				return 1
		else:
			print("comment %s: \"%s...\" is not requesting service: \"%s\"" % (comment.id,comment.body[:15],self.service_name))
			print("-----------------------")
			return 0
		


if __name__ == '__main__':
	pass