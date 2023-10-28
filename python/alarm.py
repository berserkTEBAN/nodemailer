import RPi.GPIO as GPIO
import time
import pymongo
from bson.objectid import ObjectId
from datetime import datetime, time as t
from loguru import logger
import smtplib
from email.mime.text import MIMEText

# Importar la librería GPIO de Raspberry Pi
###import RPi.GPIO as GPIO

# Importar la librería time
import time

# Importar la librería pymongo para conectarse con MongoDB
import pymongo

# Importar la clase ObjectId de la librería bson
#from bson.objectid import ObjectId

# Importar la clase datetime y time de la librería datetime
##from datetime import datetime, time as t

# Importar el módulo logger de la librería loguru
#from loguru import logger

# Importar la librería smtplib para enviar correos electrónicos
##import smtplib

# Importar la clase MIMEText de la librería email.mime.text
#from email.mime.text import MIMEText


servo_pins = [15, 18, 21] # Estos son los pines GPIO a los que están conectados los servos
buzzer_pin = 23 # Este es el pin GPIO al que está conectado el buzzer
led_pins = [24, 25] # Estos son los pines GPIO a los que están conectados los LEDs

# Establece el modo del pin y configura los servos y los LEDs
GPIO.setmode(GPIO.BCM)
GPIO.setup(buzzer_pin, GPIO.OUT)
GPIO.setup(led_pins, GPIO.OUT)
servos = []
for pin in servo_pins:
    GPIO.setup(pin, GPIO.OUT)
    servo = GPIO.PWM(pin, 50)
    servo.start(8)
    servos.append(servo)

# Función para activar el buzzer y los LEDs
def activar_buzzer_leds():
    GPIO.output(buzzer_pin, GPIO.HIGH) # Activa el buzzer
    GPIO.output(led_pins, GPIO.HIGH) # Activa los LEDs
    time.sleep(0.8) # Espera 0.8 segundos
    GPIO.output(buzzer_pin, GPIO.LOW) # Desactiva el buzzer
    GPIO.output(led_pins, GPIO.LOW) # Desactiva los LEDs

# Función para mover el servo
def mover_servo(servo, fecha, nombre_alarma):
    angulo = 90 # Angulo por defecto
    servos[servo - 1].ChangeDutyCycle(5) # Cambia el punto PWM del servo correspondiente al ángulo 0
    activar_buzzer_leds() # Activa el buzzer y los LEDs
    time.sleep(0.3) # Espera 0.3 segundos
    servos[servo - 1].ChangeDutyCycle(10) # Cambia el punto PWM del servo correspondiente al ángulo 180
    activar_buzzer_leds() # Activa el buzzer y los LEDs
    time.sleep(0.3) # Espera 0.3 segundos
    servos[servo - 1].ChangeDutyCycle(0) # Detiene el PWM
    logger.info(f"Alarma '{nombre_alarma}' activada en el dispensador '{servo}' el dia de '{fecha}' a a la '{hora}'")
    
    # Enviar correo electrónico
    correo_origen = 'luisfelipecruzesteban398@gmail.com'
    contraseña = 'nqcxqmcaxmlfcdlw'
    correo_destino = Prueba["email"]
    msg = MIMEText(f"Alarma '{nombre_alarma}' activada en el dispensador '{servo}' el dia de '{fecha}' a a la '{hora}' ,Recuerda Tomar tus medicamentos a la hora dispensada,programarlas a la hora correcta y recuerda,se feliz,sonriele a la vida :)")
    msg['Subject'] = 'Alerta de Alarma Activada'
    msg['From'] = correo_origen
    msg['To'] = correo_destino

    server = smtplib.SMTP('smtp.gmail.com',587)
    server.starttls()
    server.login(correo_origen,contraseña)
    server.sendmail(correo_origen,correo_destino,msg.as_string())

    server.quit()

# Conexión a la base de datos de MongoDB
try:
    cliente = pymongo.MongoClient("mongodb+srv://teban:teban@cluster0.2vvboa7.mongodb.net/?retryWrites=true&w=majority")
    db = cliente.test
    coleccion = db.alarms
    email_collection = db.usuarios
    
    Prueba = email_collection.find_one()
    
except Exception as e:
    logger.error(f"No se pudo conectar a la base de datos: {e}")

# Bucle principal
while True:
    # Busca las alarmas que están pendientes de activar
     ahora = datetime.now().time() # Hora actual
     alarmas = db.alarms.find({
         "date": {"$lte": datetime.now()},
         "time": ahora.strftime("%H:%M"), # Hora actual en formato HH:MM
         "active": False
    })
 
     # Activa las alarmas encontradas
     for alarma in alarmas:
         servo = alarma["servo"]
         fecha = alarma["date"].strftime("%Y-%m-%d")
         hora = alarma["time"]
         nombre_alarma = alarma["name"]
         mover_servo(servo, fecha, nombre_alarma)
         # Actualiza el estado de la alarma a activa
         db.alarms.update_one({"_id": ObjectId(alarma["_id"])}, {"$set": {"active": True, "contador": alarma["contador"] + 1}})
         time.sleep(10) # Espera un minuto antes de volver a buscar alarmas



  

