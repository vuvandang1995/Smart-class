## Install python3

```
sudo apt-get update
sudo apt-get -y upgrade
```

## Intall pip3

```
sudo apt-get install -y python3-pip
sudo apt-get install python3.6-dev libmysqlclient-dev
```

## Install git

`sudo apt-get install git`

## Install docker
- Sau đó chạy lệnh sau để bật redis server
`docker run -p 6379:6379 -d redis:2.8`

## Clone repo and run requirements.txt file

```
git clone https://github.com/vuvandang1995/Smart-class.git
cd SmartClass
export LC_ALL="en_US.UTF-8"
export LC_CTYPE="en_US.UTF-8"
sudo pip3 install -r requirements.txt
```


*You need to VPN to Meditech network to use the system.*
