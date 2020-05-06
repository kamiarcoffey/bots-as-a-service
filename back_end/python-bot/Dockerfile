FROM python:3

WORKDIR /app

ADD . /app
RUN pip install -r requirements.txt



ENV bucket=0
CMD ["sh","-c","python ./main.py $bucket"]


