import numpy as np
import time
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
import mechanize
from bs4 import BeautifulSoup as BS


class OAuthor():

	def __init__(self,auth,version_info):
		self.version_info = version_info
		self.username = auth['username']
		self.password = auth['password']
		self.user_agent = auth['user_agent']
		self.client_id = auth['client_id']
		self.client_secret = auth['client_secret']
		# self.driver = self.getDriver("https://www.reddit.com/login/")

		#obtain a webdriver instance
	def getDriver(self,url):
		chrome_options = webdriver.ChromeOptions()
		chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
		chrome_options.add_experimental_option('useAutomationExtension', False)
		prefs = {"profile.default_content_setting_values.notifications" : 2}
		chrome_options.add_experimental_option("prefs",prefs)

		driver = webdriver.Chrome('./driver/chromedriver',chrome_options=chrome_options)
		driver.get(url)
		time.sleep(3)
		return driver


	def powerDown(self):
		self.driver.quit()

	def hasApp(self):
		pass

	#sends characters to text input fields
	def sendInputs(self,element,inputs):
		for character in inputs:
			element.send_keys(character)
			wait_time = np.random.uniform(0,0.2)
			time.sleep(wait_time)
		time.sleep(1)

	#logs in to reddit through the GUI
	def redditLogin(self):

		username_input = self.driver.find_element_by_name('username')
		self.sendInputs(username_input,self.username)

		password_input = self.driver.find_element_by_name('password')
		self.sendInputs(password_input,self.password)

		submit_input = self.driver.find_element_by_tag_name('button')
		submit_input.submit()
		time.sleep(3)

	

	def mechanizedLogin(self):
		try:
			br = mechanize.Browser()
			cj = mechanize.CookieJar()
			br.set_cookiejar(cj)
			br.set_handle_equiv(True)
			br.set_handle_gzip(True)
			br.set_handle_redirect(True)
			br.set_handle_referer(True)
			br.set_handle_robots(False)
			br.set_handle_refresh(mechanize._http.HTTPRefreshProcessor(), max_time=1)
			time.sleep(1)

			br.open("https://www.reddit.com/login")
			time.sleep(1)

			br.select_form(class_="AnimatedForm")
			br.form['username'] = 'testing_dummy'
			br.form['password'] = 'leo030811'
			time.sleep(1)
			br.submit()

			time.sleep(1)
			r = br.open("https://www.reddit.com/prefs/apps")

			time.sleep(1)
			soup = BS(r.read(),'html.parser')
			app = soup.find('div',class_="edit-app-form")
			# print(app.prettify())
			time.sleep(1)
			client_id = app.find("input",{"name":"client_id"})['value']
			print("id: " + client_id)
			time.sleep(1)

			client_secret_table = app.find_all("tr")
			for row in client_secret_table:
				time.sleep(1)
				if row.th.text == 'secret':
					client_secret = row.td.text
					print('secret: ' + row.td.text)

			return client_id.strip(),client_secret.strip()
		except:
			return -1,-1


	#creates a new script-app on the reddit account using config['version_info']
	def createApp(self):
		print("creating app...")
		self.driver.get("https://www.reddit.com/prefs/apps")
		time.sleep(3)

		create_app_element = self.driver.find_element_by_id("create-app-button")
		create_app_element.click()

		time.sleep(2)
		name_input = self.driver.find_element_by_name("name")
		self.sendInputs(name_input,self.version_info['name'])

		type_input = self.driver.find_element_by_css_selector("input[type='radio'][value='script']").click()

		text_input = self.driver.find_element_by_tag_name("textarea")
		text_input.click()
		self.sendInputs(text_input,self.version_info['description'])

		uri_input = self.driver.find_element_by_name("redirect_uri")
		self.sendInputs(uri_input,"http://localhost:8080")

		submit_app_form = self.driver.find_element_by_css_selector("button[type='submit']")
		submit_app_form.submit()

			
	#reloads the apps page and grabs the client_id and secret
	def retrieveTokens(self):
		print("grabbing tokens...")
		self.driver.get("https://www.reddit.com/prefs/apps")
		time.sleep(3)

		try:
			app_element = self.driver.find_element_by_css_selector("div[class='content']")
			t = app_element.find_elements_by_css_selector("a")
			text = [i.text for i in t]
			loc = text.index('edit')

			edit_app_element = t[loc]
			edit_app_element.click()
			time.sleep(1)

			table_row_element = self.driver.find_element_by_xpath("//table[@class='preftable']/tbody/tr")
			client_secret = table_row_element.find_element_by_tag_name("td")
			print("client_secret: ",client_secret.text)

			app_details = self.driver.find_element_by_xpath("//div[@class='app-details']")
			client_id = app_details.find_elements_by_tag_name("h3")[1]
			print("client_id: ",client_id.text)

			return client_secret.text.strip(),client_id.text.strip()

		except Exception as e:
			print(e)
			return -1,-1


	#if something goes wrong with authorization, clean up by deleting the faulty app
	def deleteApp(self):
		print('deleting app...')
		self.driver.get("https://www.reddit.com/prefs/apps")
		time.sleep(3)

		

		# try:
		app_element = self.driver.find_element_by_css_selector("div[class='content']")
		t = app_element.find_elements_by_css_selector("a")
		text = [i.text for i in t]
		loc = text.index('edit')

		edit_app_element = t[loc]
		edit_app_element.click()
		time.sleep(1)

		delete_app_element = self.driver.find_element_by_css_selector("a[class='togglebutton access-required']")
		delete_app_element.click()
		time.sleep(1)

		confirm_element = self.driver.find_element_by_css_selector("a[class='yes'][href='javascript:void(0)']")
		self.driver.execute_script("arguments[0].click();", confirm_element)







		




# if __name__ == '__main__':


