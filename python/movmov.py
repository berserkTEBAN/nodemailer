# Importar la librería GPIO de Raspberry Pi
import RPi.GPIO as GPIO

# Importar la librería time
import time

# Importar la librería subprocess
import subprocess

# Establecer el modo de numeración de los pines GPIO
GPIO.setmode(GPIO.BCM)

# Definir el número del pin GPIO que se utilizará para el sensor
sensor_pin = 12

# Configurar el pin GPIO como una entrada para el sensor
GPIO.setup(sensor_pin, GPIO.IN)

# Iniciar un bucle infinito que se ejecutará continuamente
while True:
    # Verificar si hay una señal de entrada en el pin GPIO del sensor
    if GPIO.input(sensor_pin):
        # Si se detecta una señal, imprimir un mensaje en la consola
        print("Movimiento detectado!")
        # Ejecutar el otro archivo de Python utilizando subprocess
        subprocess.run(["python", "/home/tebanuwu/cam1.py"])

    # Esperar 0.1 segundos antes de continuar con el siguiente ciclo del bucle
    time.sleep(0.1)

# Limpiar los pines GPIO antes de finalizar el programa
GPIO.cleanup()
