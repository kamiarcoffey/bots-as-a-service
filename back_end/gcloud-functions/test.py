import yaml
import json
import requests
import time

from flask import make_response, jsonify, abort
from google.cloud import storage
from google.cloud import container_v1
from google.cloud.exceptions import NotFound
from kubernetes import client, config


########################
# Tests
########################


def test_get_bots():
    try:
        bucket_name = "bot-configurations"
        storage_client = storage.Client()
        bucket = storage_client.get_bucket(bucket_name)
        blobs = storage_client.list_blobs(bucket_name)

        response_list = [blob.download_as_string() for blob in blobs]

        print({"bots": response_list})

    except KeyError as e:
        print(str(e))
    except Exception as e:
        print(str(e))


def test_create_bot():

    URL = "https://us-central1-bots-as-a-service.cloudfunctions.net/create_bot"

    headers = {"Content-Type": "application/json"}

    with open("bot_configuration.json") as file:
        config = json.load(file)
        bot = "hello-python"
        payload = json.dumps({"bot-name": bot, "config": config})
        response = requests.post(url=URL, headers=headers, data=payload)
        print("Response Status", response)
        if response.status_code == requests.codes.ok:
            print("Reponse", response.json())


def test_activate_bot():
    URL = "https://us-central1-bots-as-a-service.cloudfunctions.net/activate_bot"
    response = requests.post(url=URL + "/?id=hello-python")
    print("Response Status", response)
    if response.status_code == requests.codes.ok:
        print("Reponse", response.json())


def test_get_bots1():

    URL = "https://us-central1-bots-as-a-service.cloudfunctions.net/get_bots"
    response = requests.post(url=URL)
    print("Response Status", response)
    if response.status_code == requests.codes.ok:
        print("Reponse", response.text)


def test_deactivate_bot():

    URL = "https://us-central1-bots-as-a-service.cloudfunctions.net/deactivate_bot"
    response = requests.post(url=URL + "/?id=hello-python")
    print("Response Status", response)
    if response.status_code == requests.codes.ok:
        print("Reponse", response.json())


def test_deactivate_bot_local(bot_name):

    try:
        config.load_kube_config("config")
        k8s_apps_v1 = client.AppsV1Api()
        api_response = k8s_apps_v1.delete_namespaced_deployment(
            name=bot_name,
            namespace="default",
            body=client.V1DeleteOptions(
                propagation_policy="Foreground", grace_period_seconds=5
            ),
        )
        print("Deployment deleted. status='%s'" % str(api_response.status))
    except Exception as e:
        print(e)


if __name__ == "__main__":
    pass
