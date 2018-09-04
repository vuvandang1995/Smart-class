# chat/consumers.py
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
import json
from .models import *
from channels.layers import get_channel_layer
import fileinput
from datetime import datetime
from datetime import timedelta


