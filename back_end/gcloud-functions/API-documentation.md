BOTS AS A SERVICE
============

Authentication
--------------
No auth for dev


Bot Management on Google Kubernetes Engine
---------------------------------

## Create Bot
### Sends Bot Configuration to Container and generates YAML file to deploy but does not activate the container

#### Require
-	Headers:
	-	Content-Type: application/json
-	On Body as json:
	-	bot-name
	-	config

#### Returns
-	bot id

#### Example

```bash
curl --request POST 'https://us-central1-bots-as-a-service.cloudfunctions.net/create_bot' \
--header 'Content-Type: application/json' \
--data-raw '{
    "bot-name": "test",
    "config":
    	{
		"name": "faretix",
		"auth": {
			"client_id": "zzv4UeSlQztD9g",
			"client_secret": "qD7Bk6ba3X95yxrUQNf5tLhR7fY",
			"username": "faretix",
			"password": "botsasaservice",
			"user_agent": "thank you, bots as a service ;)"
		},
		"status": {
			"online": false,
			"valid": true
		},
			"config": {
			"subreddits": [
				"london"
		],
		"comments_enabled": true,
		"livestream_enabled": false,
		"keyphrase": "!faretix",
		"services": [
			{
			"service_name": "spellchecker",
			"language": "en_US"
			}
		]
    }
  }
}'
```

```json
{
	"result": "ok",
	"message": {"id": "TEST"}
}
```

### Register Bot / Activate Bot

#### Require

-	Headers:
	-	Content-Type: application/json
-	On Body as json:
	-	bot-name
	-	config

#### Example

##### Python
    response = requests.post(('https://us-central1-bots-as-a-service.cloudfunctions.net/register_bot/?bot-name=test'))
	where 'test' is substituted for bot name

```json
{
    "result": "ok"
}
```

## gcloud commands cheat sheet

gcloud auth activate-service-account --key-file=baas.json
gcloud container clusters get-credentials bots --zone us-central1-c
kubectl get svc
cp ~/.kube/config ./config

gcloud functions deploy get-bots --entry-point=get_bots --runtime python37 --trigger-http
gcloud functions deploy create-bot --entry-point=create_bot --runtime python37 --trigger-http
gcloud functions deploy activate-bot  --entry-point=activate_bot --runtime python37 --trigger-http
gcloud functions deploy deactivate-bot --entry-point=deactivate_bot --runtime python37 --trigger-http
gcloud functions deploy delete-bot --entry-point=delete_bot --runtime python37 --trigger-http


### deploy an function that reads metadata from new objects in storage

gcloud functions deploy helloworld --runtime python37 --trigger-resource deployment-yaml --trigger-event google.storage.object.finalize

gcloud functions logs read --limit 50

kubectl config view

gcloud config set project bots-as-a-service
gcloud config set compute/zone us-west1-a
gcloud container clusters create bots --num-nodes=4
gcloud container clusters get-credentials bots
gcloud container clusters delete cluster bots

# for just deploy (DOES NOT INCLUDE SERVICES)
# would need service.yaml

kubectl apply -f hub-deployment.yaml
export GOOGLE_APPLICATION_CREDENTIALS=bots-as-a-service-60111dde3f6d.json

gcloud config set account kaco2654@colorado.edu
gcloud config set project bots-as-a-service
