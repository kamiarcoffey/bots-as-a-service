import praw
import json
from collections import defaultdict
from google.cloud import storage
import hashlib
from OAuthor import *
from BotService import *


class RedditBot:

	#if OAuth is not already created, need to call OAuth script
	def __init__(self, path : str, gcp : bool = True, testing: bool = False):
		self.path = path
		if not testing:
			if gcp:
				self.config = self.loadRemoteConfig(path)
				
			else:
				self.config = self.loadLocalConfig(path)

			auth = self.isUnauthorized()
			print("authorized: ", self.isUnauthorized())

			
			#TODO check valid status and configure error message
			#do this in pytest?


			self.services = self.configureServices()
			print("Services: ",self.services)
			self.client = self.authenticate()

			#TODO - generate empty output structure if no file exists for output


			#TODO - check for previous post logs to read in
			# or just read in previous output data object for incrementing
			self.post_log = defaultdict(lambda: {"visited":0,"date":None})
		else:
			self.services = None
			self.config = None
			self.client = None
			self.post_log = None


	#replace with loadRemote once GCP is implemented
	def loadLocalConfig(self,path : str):
		print("loading config")
		with open(path, 'r') as f:
			return json.load(f)

	#check to see if we have client_id and client_secret
	def isUnauthorized(self):
		if not self.config['auth']['client_id'] or not self.config['auth']['client_secret']:
			return self.generateOAuth()
		elif self.config['auth']['client_id'].isspace() or self.config['auth']['client_secret'].isspace():
			return self.generateOAuth()
		elif self.config['auth']['client_id'] == self.config['auth']['client_secret']:
			return self.generateOAuth()
		else:
			self.config['status']['online'] = True
			self.updateRemoteConfig()
			return True

	#log in to reddit
	def authenticate(self):
		print("authenticating client")
		return praw.Reddit(client_id=self.config['auth']['client_id'],
						   client_secret=self.config['auth']['client_secret'],
						   password=self.config['auth']['password'],
						   user_agent=self.config['auth']['user_agent'],
						   username=self.config['auth']['username'])

	#create BotService objects from config parameters
	def configureServices(self):
		services = self.config['services']
		service_objects = []
		print("configureServices")
		for service in services:
			if 'fandom' in service['service_name']:
				service_objects.append(FandomService(service))
			elif "translate" in service['service_name']:
				service_objects.append(TranslateService(service))
		return service_objects

	#call each service's .run() method on each subreddit
	def run(self):
		try:
			print('+'.join(self.config['subreddits']))
			for comment in self.client.subreddit('+'.join(self.config['subreddits'])).stream.comments(skip_existing=True):
				for service in self.services:
					service.run(comment)
		except:
			self.config['status']['online'] = False
			self.updateRemoteConfig()

	#read the config file from GCP
	def loadRemoteConfig(self, gcp_url : str):
		storage_client = storage.Client.from_service_account_json('./credentials/baas.json')
		blobs = storage_client.list_blobs('bot-configurations')
		for blob in blobs:
			print(blob.name)
			if blob.name == self.path:
				json_data = blob.download_as_string(client=None).decode("utf-8")
				return json.loads(json_data)
		bucket = storage_client.get_bucket('bot-configurations')
		try:
			blob = bucket.get_blob(self.path + '.json')
		except:
			blob = bucker.get_blob(self.path)
		
		json_data = blob.download_as_string(client=None).decode("utf-8")
		return json.loads(json_data)

	#update config file with status['online'] = True (and status['valid'] = True ?)
	#populate the OAuth fields for the config update
	def updateRemoteConfig(self):
		storage_client = storage.Client.from_service_account_json("./credentials/baas.json")
		bucket = storage_client.get_bucket('bot-configurations')
		blobs = storage_client.list_blobs('bot-configurations')
		for blob in blobs:
			print(blob.name)
			if blob.name == self.path:
				blob.upload_from_string(json.dumps(self.config,indent=2))
				return

				
		# hasher = hashlib.md5()
		# hasher.update(bytes(self.config['auth']['username'],"utf-8"))
		# blob = bucket.blob(self.path)
		# blob.upload_from_string(json.dumps(self.config,indent=2))
		

	def generateOAuth(self):

		author = OAuthor(self.config['auth'],self.config['version_info'])
		client_id, client_secret = author.mechanizedLogin()
		# = author.retrieveTokens()
		if client_secret == client_id: 
			# print("something went wrong, OAuth not present")
			# time.sleep(5)
			# author.createApp()
			# client_secret, client_id = author.retrieveTokens()
			# # author.deleteApp()
			# author.powerDown()
			# self.config['auth']['client_id'] = client_id
			# self.config['auth']['client_secret'] = client_secret
			# self.updateRemoteConfig()
			return False
		else:
			self.config['auth']['client_id'] = client_id
			self.config['auth']['client_secret'] = client_secret
			self.config['status']['online'] = True
			self.client = self.authenticate()
			if self.client.user.me() == self.config['auth']['username']:
				self.updateRemoteConfig()
				return True



	#TODO - read/write service data to GCP
	def postOutputData(self, gcp_url : str):
		#should I log direct messages and responses here or separately?
		pass

	def pullOutputData(self, gcp_url : str):
		pass


	#TODO - check if a reddit app exists on this account already. if so, just grab the credentials
	def hasApp(self):
		pass





if __name__ == '__main__': 
	r = RedditBot("9f05059f393732565ec85b18c5d05866",gcp=True)
	r.run()

# 	pass