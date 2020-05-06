""" Main API. """
import yaml
import json

from flask import jsonify, abort

from google.cloud import storage
from google.cloud.exceptions import NotFound
import kubernetes as kube
from kubernetes.client.rest import ApiException

########################
# In Use Functions
########################

GLOBAL_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
}


def _create_response(message, code):
    r_body = ""
    if code != 204:
        if 200 <= code < 399:
            status = "success"
        else:
            status = "error"
        r_body = jsonify({"status": status, "message": message})

    return (r_body, code, GLOBAL_HEADERS)


def _create_error_response(message, ex=None):
    r_body = {"status": "error", "message": message, "details": None}
    if ex is not None:
        print(f"ERROR OCCURRED: {repr(ex)}")
        r_body["details"] = repr(ex)

    r_body = jsonify(r_body)
    return (r_body, 500, GLOBAL_HEADERS)


def _handle_request(request, required_method="GET"):
    if request.method == "OPTIONS":
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": required_method,
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
        }

        return ("", 204, headers)
    elif request.method != required_method:
        abort(405)


def get_bots(request):
    result = _handle_request(request, "GET")
    if result is not None:
        # If we got a result, that means we didn't pass all the checks
        # and we need to return this back.
        return result
    else:
        # This is the success case -- we've passed all the checks and we're good to go.
        try:
            bucket_name = "bot-configurations"
            storage_client = storage.Client()
            # bucket = storage_client.get_bucket(bucket_name)
            blobs = storage_client.list_blobs(bucket_name)
            response_list = [json.loads(blob.download_as_string()) for blob in blobs]

            return json.dumps(response_list), 200, GLOBAL_HEADERS
        except KeyError as ex:
            return _create_error_response("can't find any bots!", ex)
        except Exception as ex:
            return _create_error_response("unexpected error", ex)


def create_bot(request):
    result = _handle_request(request, "POST")
    if result is not None:
        # If we got a result, that means we didn't pass all the checks
        # and we need to return this back.
        return result
    else:
        json_data = request.get_json(force=True)
        # explicitly pass the name - used for YAML should be independent from config format
        bot_name = json_data.get("bot-name")
        config = json_data.get("config")

        if config is None or len(config) == 0:
            return _create_response("no valid 'config' in request body.", 400)

        if bot_name is None or len(bot_name) == 0:
            return _create_response("no valid 'bot-name' in request body.", 400)

        bot_id = bot_name
        # uuid here

        try:
            """Upload a file to the bucket."""
            storage_client = storage.Client()
            bucket_name = "bot-configurations"
            bucket = storage_client.bucket(bucket_name)
            blob = bucket.blob(bot_id)
            blob.upload_from_string(json.dumps(config))

            """Upload a file to the bucket."""
            yaml_template = {
                "apiVersion": "apps/v1",
                "kind": "Deployment",
                "metadata": {"name": bot_name},
                "spec": {
                    "selector": {"matchLabels": {"app": bot_name}},
                    "replicas": 1,
                    "template": {
                        "metadata": {"labels": {"app": bot_name}},
                        "spec": {
                            "containers": [
                                {
                                    "name": "application",
                                    "image": "index.docker.io/kamiarcoffey/bots-as-a-service:bot",
                                    "env": [{"name": "bucket", "value": bot_id}],
                                    "imagePullPolicy": "Always",
                                    "ports": [{"containerPort": 5000}],
                                }
                            ]
                        },
                    },
                },
            }
            yaml_bucket = storage_client.bucket("deployment-yaml")
            blob1 = yaml_bucket.blob(bot_id)
            blob1.upload_from_string(json.dumps(yaml_template))

            return jsonify({"id": "{}".format(bot_id)}), 201, GLOBAL_HEADERS
        except Exception as err:
            return _create_error_response("unexpected error", err)


def activate_bot(request):
    result = _handle_request(request, "PUT")
    if result is not None:
        # If we got a result, that means we didn't pass all the checks
        # and we need to return this back.
        return result
    else:
        json_data = request.get_json(force=True)
        bot_id = json_data.get("id")
        print(f"Now attempting to activate bot ID: {bot_id}")
        if bot_id is None:
            return _create_response("no valid 'id' in request body.", 400)
        try:
            storage_client = storage.Client()
            bucket = storage_client.get_bucket("deployment-yaml")
            bot_yaml = str(bot_id)
            blob = bucket.blob(bot_yaml)
            contents = blob.download_as_string()
            print(f"Found deployment yaml file with contents: {contents}")
            dep = yaml.safe_load(contents)

            print(f"Now loading kubeconfig configuration object...")
            kube.config.load_kube_config("config")

            print(f"Now connecting to K8s.")
            k8s_apps_v1 = kube.client.AppsV1Api()
            print(f"Connected to client; creating deployment.")
            resp = k8s_apps_v1.create_namespaced_deployment(
                body=dep, namespace="default"
            )

            status = "deployment created. status: {}".format(resp.metadata.name)
            return _create_response(status, 202)
        except ApiException as ex:
            return _create_error_response("could not create deployment", ex)
        except NotFound:
            return _create_response(f"could not find bot with id: {bot_id}", 404)
        except Exception as ex:
            return _create_error_response("unexpected error", ex)


def deactivate_bot(request):
    result = _handle_request(request, "PUT")
    if result is not None:
        # If we got a result, that means we didn't pass all the checks
        # and we need to return this back.
        return result
    else:
        json_data = request.get_json(force=True)
        bot_id = json_data.get("id")
        print(f"Now attempting to deactivate bot ID: {bot_id}")
        if bot_id is None:
            return _create_response("no valid 'id' in request body.", 400)

        try:
            storage_client = storage.Client()
            bucket = storage_client.get_bucket("bot-configurations")
            blob = bucket.blob(bot_id)
            config_file = json.loads(
                blob.download_as_string(client=None).decode("utf-8")
            )
            config_file["status"]["online"] = False
            blob.upload_from_string(json.dumps(config_file, indent=2))
        except Exception as idk:
            print(str(idk))

        try:
            kube.config.load_kube_config("config")
            k8s_apps_v1 = kube.client.AppsV1Api()
            resp = k8s_apps_v1.delete_namespaced_deployment(
                name=bot_id,
                namespace="default",
                body=kube.client.V1DeleteOptions(
                    propagation_policy="Foreground", grace_period_seconds=5
                ),
            )

            status = "deployment deleted."
            return jsonify({"message": status}), 200, GLOBAL_HEADERS
        except ApiException as error:
            return _create_error_response("could not create deployment", error)
        except NotFound:
            return _create_response(f"could not find bot with id: {bot_id}", 404)
        except Exception as error:
            return _create_error_response("unexpected error", error)


def delete_bot(request):
    result = _handle_request(request, "DELETE")
    if result is not None:
        # If we got a result, that means we didn't pass all the checks
        # and we need to return this back.
        return result
    else:
        json_data = request.get_json(force=True)
        bot_id = json_data.get("id")
        print(f"Now attempting to delete bot ID: {bot_id}")
        if bot_id is None:
            return _create_response("need 'id' key in body.", 400)

        try:
            """Delete a file from the bucket."""
            storage_client = storage.Client()
            buckets = ["bot-configurations", "deployment-yaml"]
            for bucket_name in buckets:
                print(f"Now deleting from bucket: {bucket_name}")
                try:
                    bucket = storage_client.bucket(bucket_name)
                    blob = bucket.blob(bot_id)
                    blob.delete(client=storage_client)
                except NotFound:
                    # If we don't find a file with the given name, we actually accomplished our goal. Yay!
                    print(f"Did not find bot with id: {bot_id}")
                else:
                    print(f"Successfully deleted bot with id: {bot_id}")
        except Exception as err:
            return _create_error_response("unexpected error", err)
        else:
            return _create_response("", 204)


if __name__ == "__main__":
    # bot_id = 'test-bot'
    # storage_client = storage.Client()
    # bucket = storage_client.get_bucket("deployment-yaml")
    # bot_yaml = str(bot_id)
    # blob = bucket.blob(bot_yaml)
    # contents = blob.download_as_string()
    # print(f"Found deployment yaml file with contents: {contents}")
    # dep = yaml.safe_load(contents)

    # print(f"Now loading kubeconfig configuration object...")
    # kube.config.load_kube_config("config")

    # print(f"Now connecting to K8s.")
    # k8s_apps_v1 = kube.client.AppsV1Api()
    # print(f"Connected to client; creating deployment.")
    # resp = k8s_apps_v1.create_namespaced_deployment(body=dep, namespace="default")

    # status = "deployment created. status: {}".format(resp.metadata.name)
    # print(status)

    # kube.config.load_kube_config("config")
    # k8s_apps_v1 = kube.client.AppsV1Api()
    # resp = k8s_apps_v1.delete_namespaced_deployment(
    #     name=bot_id,
    #     namespace="default",
    #     body=kube.client.V1DeleteOptions(
    #         propagation_policy="Foreground", grace_period_seconds=5
    #     ),
    # )

    # print(dir(resp.metadata))

    # status = "deployment deleted. status: '{}".format(resp.metadata.name)

    # storage_client = storage.Client()
    # bucket = storage_client.get_bucket('bot-configurations')
    # blob = bucket.get_blob(bot_id)
    # config_file = json.loads(blob.download_as_string(client=None).decode("utf-8"))
    # config_file['status']['online'] = False
    # blob.upload_from_string(json.dumps(config_file,indent=2))

    # print(status)
    pass
