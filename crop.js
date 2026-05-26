const Jimp = require('jimp');

Jimp.read('public/logo.png')
  .then(image => {
    // autocrop() elimina los bordes del mismo color automáticamente
    image.autocrop()
         .write('public/logo.png');
    console.log("¡Imagen recortada exitosamente con Node!");
  })
  .catch(err => {
    console.error("Error recortando:", err);
  });
