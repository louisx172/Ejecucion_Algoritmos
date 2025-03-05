# Pagina para traer, mostrar y ejecutar algoritmos de un repo

==================================================================================================

Descripción general del proyecto:

El proyecto se trata de una pagina con el objetivo de mostrar y ejecutar algoritmos.

El proyecto trae el algoritmo que ha sido clicado directamente de Github usando su API,
lo muestra, y en caso de que el usuario ingrese una entrada lo envia al servidor con
la modificación de la entrada, lo ejecuta, genera el resultado y en caso de contener una
animación lo coptura en frames para crear una visualización con Plotly y mostrarlo en un
ifrmae.


==================================================================================================

Como hacer funcionar el proyecto:

1. En consola iniciar el proyecto "pagina_algoritmos" usando el comando "npm run dev"

2. Iniciar el servidor usando "node servidor.js"

==================================================================================================

Funcionamiento general del proyecto:

1. Obtenición de los algoritmos: En Algoritmos.jsx, el componente hace una llamada a la API de
	GitHub para obtener la lista de archivos dentro del repositorio con la URL del mismo y
	se extraen los nombres.

2. Mostrar algoritmos: Los algoritmos se muestran en la barra lateral izquierda como un elemento
	clickeable. Al hacer clic en un algoritmo, se ejecuta fetchAlgorithmContent(), el cual
	obtiene el codigo de cada archivo para cada lenguaje soportado (Python, JavaScript, C++),
	luego el codigo se muestra en el panel lateral derecho segun su lenguaje.

	Ejemplo. Si los archivos en GitHub son:

	Suma.py
	Suma.js
	Suma.c++

	Entonces en la pagina solo se mostrara un "Suma" en la parte lateral izquierda, pero se
	podra cambiar entre el lenguaje en la parte lateral derecha.

3. Preparación de ejecución: Al seleccionar un algoritmos, se analiza el código para determinar
	cuantas entradas necesita, si el codigo usa "sys.argv[1:]", crea un unico campo de entrada
	para multiples valores como por ejemplo arrays; para otros casos crea campos entrada
	individual segun los "sys.argv[n]" encontrados.

4. Ejecución: Cuando se hace clic en el boton "Ejecutar algoritmo", el codigo y las entradas se
	envian al servidor usando handleRunAlgorithm(). El servior (servidor.js) crea un archivo
	temporal con el codigo, ejecuta el codigo y captura la salida del programa.

5. Animación: En caso de que el algoritmo posea una animación, por ejemplo heapsort2.py, cada
	paso del ordenamiento se guarda en frames que contienen el esta actual del array, los
	elementos activos, elemento actual procesado y colores para la visualización.

6. Visualización: La salida JSON del algoritmo se envia al endpoint /generate-visualization.
	El servidor usa generate_plotly.py para leer los datos JSON, crear la animación usando
	Plotly y generar un archivo HTML con la visualización con controles de reproducción.

7. Mostrar visualización: Una ves que se genero la visualizacion, se devuelve la URL del archivo<
	HTML y el componente React muestra la visualización en un iframe.

==================================================================================================

Cosas por implementar y/o completar:


* Permiso de carga de repositorios privados: Actualmente el proyecto solo puede traer los
	algoritmos que se encuentren dentro de un repositorio de Github en publico. Debido
	a que el repositorio de CICCTTE es privado esto generaria problemas en su
	implementación final.

* Implementación general de carga de animaciones: La programación actual permite mostrar
	el resultado de las animaciones de algoritmos como "Heapsort" (usado a modo de
	prueba), pero sospecho que esto no sera igual para otros casos especiales como
	el "Countingsort" el cual utiliza 3 animaciones.

* Permitir grandes cantidades de entradas: La animación no responde de buena manera al
	ingresar arrays relativamente grandes, lo que provoca que la animación no se
	muestre correctamente. 

* Limpiar codigo Docker: El proyecto fue en un inicio pensado para usar Docker, puede que
	aun quede codigo de esta implementación.

* Decidir el mejor metodo de visualizar las animaciones: Vea la nota 2

==================================================================================================

Notas importantes:

1. Solo los algoritmos que usen sys podran ser ejecutados en el algoritmo, por ejemplo 
	heapsort2.py

2. Que metodologia usar para mostrar las animaciones de los algoritmos aun esta inconclusa, es
	por eso que el codigo permite tanto mostrarlos en el iframe dentro de la pagina (heapsort2.py), 
	como en otra pestaña del navegador (heapsort3.py), segun como este desarrollado el 
	propio codigo del algoritmo.

3. Las descripciones y datos que se muestran al clicar en cada algoritmo estan guardadas y son
	traidas del archivo data.json, el cual tambien debe de estar dentro del repositorio de
	GitHub.

4. Cambiar la siguiente linea de codigo por la dirección del repositorio de Prueba1.jsx y de Algoritmos.jsx:

	const repoUrl = 'https://github.com/nombre_user/nombre_repo';
