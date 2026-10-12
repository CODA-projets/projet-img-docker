### 1 - Un fichier reçu par courriel, dont vous vous méfiez, et qu'il faut quand même ouvrir pour savoir ce qu'il fait.

→ Machine Vitruelle

La machine virtuelle est totalement isolée.  Elle permet d’empêcher le fichier malveillant d’accéder à notre machine. Le conteneur partage son noyau et est donc moins étanche.

### 2 - Cinquante exemplaires de la même petite application web, à démarrer en moins d'une minute.

→ Conteneurs

Les conteneurs démarrent en moins d'une seconde et ils partagent le système d'exploitation. Ils sont très légers sur la mémoire. Une machine virtuelle et un os prennent plusieurs minutes pour démarrer et sont bien plus lourds.

### 3 - Un logiciel qui n'existe que pour Windows, à faire tourner depuis un poste sous Linux.

→ Machine virtuelle. 

Le conteneur partage le noyau Linux, le logiciel ne tournera donc pas non plus. La machine virtuelle simule un noyau Windows et nous permet donc de faire tourner le logiciel.

### 4 - Un jeu dont l'anti-triche s'installe en mode noyau.

→ l’OS. 

Le logiciel anti-triche a besoin de tourner en mode kernel (mode noyau) pour surveiller tout des processus. Une machine virtuel ou un conteneur ne permet pas ce mode noyau.

### 5 - Un poste de développement qui doit faire tourner exactement la même version d'application que le serveur de l'entreprise.

→ Conteneur. 

Un conteneur peut être programmé exactement sur les mêmes versions que le serveur sans empêcher le développeur d’utiliser d’autres versions de ces outils. On utilise la même image sur le poste de développement et sur le serveur.

### 6 - Un seul serveur physique, et dix équipes qui veulent chacune leur environnement complet, avec leur propre système d'exploitation.

→ Machine virtuelle. 

La machine virtuelle simule un ordinateur avec son propre OS. Le conteneur partage le meme OS. La machine virtuelle garantit isolation totale entre les dix OS.

### 7 - Une base de données dont le contenu doit survivre à la suppression de ce qui la fait tourner.

→ Conteneur. 

Le conteneur est un environnement jetable . On peut y configurer un volume pour que les données soient stockées à l’extérieur du conteneur ce qui leur empêche d’être supprimées en même temps que le conteneur.

### 8 - Vous êtes sous Windows ou macOS, et vous lancez un conteneur Linux. Qu'est-ce qui tourne réellement sur votre machine ?

→ Une machine virtuelle. 

Un conteneur Linux a besoin d’un noyau Linux. L'application Docker lance une machine virtuelle Linux et les conteneurs s’exécutent dans cette machine virtuelle.

### 9 - Vous développez un projet avec une API qui utilise Node.js et une base de données MySQL et vous souhaitez tester le code sans conserver les dépendances.

→ Conteneur. 

Le conteneur est rapide et jetable. Il nous permet de tester rapidement notre code puis de le supprimer ce qui enlève également les dépendances installées dessus.