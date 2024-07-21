<h1 align="center"> AI Real-Time Audio Translation </h1>
<p align="center"> Main repository of AMD Pervasive AI Developer Contest @ Infinite Learning of AI Real-time Audio Translation teams. </p>

<div align="center">
    <!-- Your badges here -->
    <img src="https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54">
    <img src="https://img.shields.io/badge/jupyter-%23FA0F00.svg?style=for-the-badge&logo=jupyter&logoColor=white">
    <img src="https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white">
    <img src="https://img.shields.io/badge/TensorFlow-%23FF6F00.svg?style=for-the-badge&logo=TensorFlow&logoColor=white">
    <img src="https://img.shields.io/badge/Keras-%23D00000.svg?style=for-the-badge&logo=Keras&logoColor=white">
    <img src="https://img.shields.io/badge/scikit--learn-%23F7931E.svg?style=for-the-badge&logo=scikit-learn&logoColor=white">
    <img src="https://img.shields.io/badge/pandas-%23150458.svg?style=for-the-badge&logo=pandas&logoColor=white">
    <img src="https://img.shields.io/badge/numpy-%23013243.svg?style=for-the-badge&logo=numpy&logoColor=white">
    <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB">
    <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white">
    <img src="https://img.shields.io/badge/Flutter-%2302569B.svg?style=for-the-badge&logo=Flutter&logoColor=white">
    <img src="https://img.shields.io/badge/dart-%230175C2.svg?style=for-the-badge&logo=dart&logoColor=white">
</div>

### Teams

- Arifian Saputra [(arifian853)](https://github.com/arifian853)
- Fariq Almasri [(Fariq211200)](https://github.com/Fariq211200)
- M. Ikhlasul Akbar [(PinoyBloon)](https://github.com/PinoyBloon)
- Fadliman Hagianto [(Fhagianto)](https://github.com/Fhagianto)

### Project flow
This is how the project will run, in a simple term :

<img src="img/project-flow.jpg"> 

### Backend Requirements

- These are requirements for the backend project : 
```
openai-whisper
Flask
flask_cors
torch
librosa
transformers
pydub
sentencepiece
```

- Make new virtual environment with the name 'venv' : 

```
python -m venv venv
```

- Activate it with : 

```
./venv/Scripts/activate
```

- Install requirements

```
pip install -r requirements.txt
```

- Run the server :

```
py server5.py
```
- Backend will served in ```localhost:5000```, and will only serve ```/transcribe``` endpoint.
```
http://localhost:5000/transcribe
```


### Frontend Requirements

- Install the dependency : 
```
npm install
```
- Run the app
```
npm run dev
```
- The app will run at : 
```
http://localhost:5173
```

### Model used in backend

- OpenAI Whisper as Automatic Speech Recognition
- MarianMT as Machine Translation
- 
- 