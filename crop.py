from PIL import Image, ImageChops

def trim(im):
    # Convertir a RGB si no lo está para evitar problemas con alpha
    im = im.convert("RGB")
    # Obtener el color del pixel superior izquierdo (asumiendo que es el color de fondo, blanco)
    bg = Image.new(im.mode, im.size, im.getpixel((0,0)))
    diff = ImageChops.difference(im, bg)
    # Aumentar contraste
    diff = ImageChops.add(diff, diff, 2.0, -100)
    # Obtener el recuadro delimitador
    bbox = diff.getbbox()
    if bbox:
        return im.crop(bbox)
    return im

try:
    im = Image.open('public/logo.png')
    trimmed_im = trim(im)
    trimmed_im.save('public/logo.png')
    print("Imagen recortada con éxito.")
except Exception as e:
    print(f"Error al recortar la imagen: {e}")
