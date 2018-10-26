# 1) Triển khai MySQL server
**smdb**: là tên sudo user hãy thay đổi tương ứng cho sudoer  user của bạn
### Cài đặt môi trường cần thiết 
```
sudo apt-get update
sudo apt-get -y upgrade
sudo apt-get install -y npm stunnel4 supervisor
wget -qO- https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Tải các gói cần thiết
```
git clone https://github.com/dung1101/RTC-server.git
cd /home/smdb/RTC-server/peerjs/
npm install
cd /home/smdb/RTC-server/RTC_call
npm install --production
cd /home/smdb/RTC-server/RTC_share
npm install --production
cd /usr/local/lib/
sudo npm install peer
sudo npm install peer -g
```

### Tạo chứng chỉ
```
sudo openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt
```

### Cấu hình Stunnel
- tạo chứng chỉ: 
    ```
    sudo openssl genrsa -out key.pem 2048
    sudo openssl req -new -x509 -key key.pem -out cert.pem -days 1095
    su
    cat key.pem cert.pem >> /etc/stunnel/stunnel.pem
    ```
- tạo file: 'sudo nano /etc/stunnel/stunnel.conf'

    copy nội dung bên dưới:
    ```
    pid=
    
    cert = /etc/stunnel/stunnel.pem
    sslVersion = TLSv1.2
    foreground = yes
    output = stunnel.log
    
    [https]
    accept=8444
    connect=9003
    TIMEOUTclose=1
    ```

### Cấu hình supervisor
- sửa cấu hình `sudo nano /etc/supervisor/conf.d/supervisord.conf`

    copy nội dung bên dưới:

    ```
    [supervisord]
    nodaemon=true

    [program:stunnel]
    directory = /etc/stunnel/
    command= stunnel4 stunnel.conf

    [program:https1]
    command= peerjs --port 9003

    [program:sockethttps]
    directory = /home/smdb/RTC-server/RTC_call
    command= nodejs server.js

    [program:screen_https]
    directory = /home/smdb/RTC-server/RTC_share
    command= nodejs server.js

    startretries=5

    ```

### Cấu hình MySQL server
- cài đặt `sudo apt-get install -y mysql-server` (điền mật khẩu cho tài khoản root)
- đăng nhập vào mysql: `mysql -u root -p` (nhập mật khẩu đã tạo lúc dài đặt)
- tạo database: `CREATE DATABASE smart_class CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
- tạo tài khoản: `CREATE USER 'smart'@'%' IDENTIFIED BY '123456';`
- phân quyền: `GRANT ALL PRIVILEGES ON smart_class . * TO 'smart'@'%';`
- cập nhật: `FLUSH PRIVILEGES;`
- thoát: `exit;`
- thay 127.0.0.1 bằng IP của SQL server vào file `nano /etc/mysql/mysql.conf.d/mysqld.cnf`
- restart `/etc/init.d/mysql restart`

### Chạy server RTC
```
sudo systemctl start supervisor
sudo systemctl enable supervisor
```

# 2) Triển khai web server
**ticket**: là tên sudo user hãy thay đổi tương ứng cho sudoer user của bạn
### Cài đặt môi trường cần thiết 
```
sudo apt-get update
sudo apt-get -y upgrade
sudo apt-get install -y python3-pip 
sudo apt-get install -y python3.5-dev libmysqlclient-dev  memcached libffi-dev libssl-dev
sudo apt-get install -y git nginx
sudo apt-get install docker.io
```

### Tải source code và cài các gói cần thiết để chạy code 
```
git clone https://github.com/vuvandang1995/Smart-class.git
cd Smart-class
export LC_ALL="en_US.UTF-8"
export LC_CTYPE="en_US.UTF-8"
sudo pip3 install -r requirement.txt
sudo pip3 install -U Twisted[tls,http2]
```

### Tạo chứng chỉ SSL
- chạy câu lệnh:
    ```
    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt
    ```
- điền thông tin như bên dưới:
    ```
    Country Name (2 letter code) [AU]:US
    State or Province Name (full name) [Some-State]:New York
    Locality Name (eg, city) []:New York City
    Organization Name (eg, company) [Internet Widgits Pty Ltd]:Bouncy Castles, Inc.
    Organizational Unit Name (eg, section) []:Ministry of Water Slides
    Common Name (e.g. server FQDN or YOUR name) []:server_IP_address
    Email Address []:admin@your_domain.com
    ```
- tạo DH group
    ```
    sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
    ```
- tạo file:  `sudo nano /etc/nginx/snippets/self-signed.conf`
    ```
    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;
    ```
- tạo file:  `sudo nano /etc/nginx/snippets/ssl-params.conf`
    ```
    # from https://cipherli.st/
    # and https://raymii.org/s/tutorials/Strong_SSL_Security_On_nginx.html
    
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_prefer_server_ciphers on;
    ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH";
    ssl_ecdh_curve secp384r1;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    # Disable preloading HSTS for now.  You can use the commented out header line that includes
    # the "preload" directive if you understand the implications.
    #add_header Strict-Transport-Security "max-age=63072000; includeSubdomains; preload";
    add_header Strict-Transport-Security "max-age=63072000; includeSubdomains";
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    
    ssl_dhparam /etc/ssl/certs/dhparam.pem;
    ```
### Cấu hình Nginx:
`sudo nano /etc/nginx/sites-available/default`

copy nội dung bên dưới vào:

```
server {
        # SSL configuration
        listen 443 ssl default_server;
        listen [::]:443 ssl default_server;
        ssl on;
        include snippets/self-signed.conf;
        include snippets/ssl-params.conf;

        location = /favicon.ico { access_log off; log_not_found off; }

        location /static/ {
                root /home/ticket/Smart-class/SmartClass/teacher;
        }

        location /media/ {
                root /home/ticket/Smart-class/SmartClass;
        }

        location / {
                include proxy_params;
                proxy_pass https://0.0.0.0:8000;
        }

        location /wss/ {
                proxy_pass https://0.0.0.0:8443;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
        }
}

```
### Tạo Gunicorn systemd Service File
`sudo nano /etc/systemd/system/gunicorn.service`

copy nội dung bên dưới: 

```
[Unit]
Description=gunicorn daemon
After=network.target

[Service]
User=root
Group=www-data
WorkingDirectory=/home/ticket/Smart-class/SmartClass
ExecStart=/usr/local/bin/gunicorn -c gunicorn_conf.py --keyfile /etc/ssl/private/nginx-selfsigned.key --certfile /etc/ssl/certs/nginx-selfsigned.crt SmartClass.wsgi:application --reload

[Install]
WantedBy=multi-user.target
```

### Tạo Daphne systemd Service File
`nano /etc/systemd/system/daphne.service`

```
[Unit]
Description=My Daphne Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/ticket/Smart-class/SmartClass
ExecStart=/usr/local/bin/daphne -e ssl:8443:privateKey=/etc/ssl/private/nginx-selfsigned.key:certKey=/etc/ssl/certs/nginx-selfsigned.crt SmartClass.asgi:application
Restart=on-failure

[Install]
WantedBy=multi-user.target
```
### Chỉnh sửa code
**thay tất cả địa chỉ I xuất hiện bên dưới bằng địa chỉ của mysql server cho phù hợp port giữ nguyên**
`cd /home/ticket/Smart-class/SmartClass/`
- `nano SmartClass/settings.py`
    - sửa dòng 112:`'HOST': '192.168.100.22',`
- `nano student/templates/student/subjects.html`
    - sửa dòng 185: `<script src="https://192.168.100.23:9443/socket.io/socket.io.js"></script>`
- `nano student/templates/student/share.html`
    - sửa dòng 68: `<script src="https://192.168.100.23:9443/socket.io/socket.io.js"></script>`
- `nano teacher/templates/teacher/share.html`
    - sửa dòng 114: `<script src="https://192.168.100.23:9443/socket.io/socket.io.js"></script>`
- `nano teacher/templates/teacher/manage_class.html`
    - sửa dòng 331: `<script src="https://192.168.100.23:9443/socket.io/socket.io.js"></script>`
- `nano teacher/static/js/peer/share_connect.js`
    - sửa dòng 3: `audio_broad.socketURL = 'https://192.168.100.23:9443/';`
- `nano teacher/static/js/teacher/RTC/RTC.js`
    - sửa dòng 4: `connection.socketURL = "https://192.168.100.23:9443/";`
- `nano teacher/static/js/teacher/peerjs/main.js`
    - sửa dòng 16: `const peer = new Peer({ host: '192.168.100.22', port: 9003, debug: 3});`

### Migrate database
```
cd /home/ticket/Smart-Class/SmartClass/
python3 manage.py makemigrations
python3 manage.py migrate
```
### Chạy web server
```
docker run -p 6379:6379 -d redis:2.8
sudo systemctl daemon-reload
sudo systemctl start gunicorn
sudo systemctl start daphne
sudo systemctl start nginx
```
### Tạo tài khoản Admin
truy cập vào mySQL server 
```
mysql -u root -p
use smart_class;
insert into my_user values(password='pbkdf2_sha256$120000$g5frmDlYSxY1$mTT33TGmtMKw2AAQtluVO6T8uTvJowv7SCy2OZZZQ4Q=', email='admin@gmail.com', fullname='admin', username='admin', is_active=1, position=2, truong_id=1);
exit;
```
### Truy cập vào tài khoản admin với password là 1 và thay đổi lại password
