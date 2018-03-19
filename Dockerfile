FROM ubuntu:latest

FROM python:3.5-jessie

WORKDIR /Flashfood

ADD . /Flashfood

RUN pip install -r requirements.txt

EXPOSE 3000

ENV NAME wrapper

CMD ["python","server.py"]
