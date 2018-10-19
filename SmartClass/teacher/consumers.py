# chat/consumers.py
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
from channels.auth import login, logout, get_user
import fileinput
from datetime import datetime
from datetime import timedelta


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        if 'chatall' in self.room_name:
            self.room_group_name = self.room_name
        elif 'chat11' in self.room_name:
            self.room_group_name = 'chat11_%s' % self.room_name
        elif 'chatgroup' in self.room_name:
            self.room_group_name = 'chatgroup_%s' % self.room_name
        else:
            self.room_group_name = self.room_name
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        try:
            f = r'notification/chat/class/'+self.room_group_name+'.txt'
            file = open(f,'r')
            for line in file:
                message = line.split('^%$^%$&^')[0]
                who = line.split('^%$^%$&^')[1].strip()
                time = line.split('^%$^%$&^')[2].strip()
                await self.send(text_data=json.dumps({
                        'message': message,
                        'who': who,
                        'time' : time
                    }))
        except:
            pass       

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        # logout(self.scope)
        


    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        who = text_data_json['who']
        time = text_data_json['time']
        if time != 'None' and time != 'call_time' and time != 'teacher_change_group' and time != 'teacher_call' and time != 'key':
            f = r'notification/chat/class/'+self.room_group_name+'.txt'
            file = open(f,'a')
            file.write(message + "^%$^%$&^"+ who +"^%$^%$&^"+ time + "\n") 
            file.close()  
        print(time)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'who': who,
                'time' : time
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        who = event['who']
        time = event['time']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'who': who,
            'time': time
        }))
