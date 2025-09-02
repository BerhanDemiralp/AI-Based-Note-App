# Temel Python 3.10 imajını kullanıyoruz. Bu, bizim için Python'ın yüklü olduğu bir işletim sistemi ortamı yaratır.
FROM python:3.10-slim

# Konteyner içinde çalışacağımız dizini /app olarak belirliyoruz.
# Bu sayede tüm komutlarımız bu dizin içinde çalışacak.
WORKDIR /app

# requirements.txt dosyasını konteynerin /app dizinine kopyalıyoruz.
COPY requirements.txt .

# Bu komut, requirements.txt dosyasındaki tüm kütüphaneleri yüklüyor.
# Docker her katmanı önbelleğe aldığı için, bağımlılıklar değişmediği sürece bu adım bir daha çalışmaz ve zamandan tasarruf sağlar.
RUN pip install --no-cache-dir -r requirements.txt

# Geriye kalan tüm proje dosyalarını (main.py gibi) /app dizinine kopyalıyoruz.
COPY . .

# Bu komut, konteyner dışından 8000 numaralı portun erişilebilir olacağını bildirir.
EXPOSE 8000

# Konteyner her başlatıldığında çalışacak komutu belirliyoruz.
# Uvicorn, main.py içindeki app objesini 0.0.0.0 host'unda (herkesin erişebileceği) ve 8000 portunda çalıştıracak.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]