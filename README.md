# 🚀 fancyindex-theme
Forked from <https://github.com/Naereen/Nginx-Fancyindex-Theme>

A morden fancyindex-theme with high performance
## 🔧 How to use
> You need Nginx, and a depend (Example using Debian Sid 2026-06-28-08:00)
```
apt update
apt install nginx libnginx-mod-http-fancyindex
cd /var/www/html # Default Nginx website files path, you can change it if you need
git clone https://github.com/mokanove/fancyindex-theme.git
```
> In nginx.conf header(Usually in Line 1)
```
include /etc/nginx/modules-enabled/*.conf;
```
> Nginx config part
>
> ⚠️ WARN: The alias must be change to a real path, else be fatal.
```
location / {
    alias /var/www/html;
    include mime.types;
    fancyindex on;
    fancyindex_localtime on;
    fancyindex_exact_size off;
    fancyindex_header "/fancyindex-theme/header.html";
    fancyindex_footer "/fancyindex-theme/footer.html";
    fancyindex_ignore "fancyindex-theme";
}
```
### 💻 Advance
> To hide the `/` in the up of filename, add nginx config inside location to denied
```
fancyindex_show_path off;
```
## ⚖️ LICENSE
> The source LICENSE was under MIT with Copyright © 2016-17 Lilian Besson [Naereen](https://github.com/Naereen)
>
> This version licensed under the [MoPL](https://867678.xyz/doc/MoPL)