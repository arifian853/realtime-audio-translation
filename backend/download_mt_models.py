from transformers import MarianMTModel, MarianTokenizer

# Define the model names
model_names = [
    'Helsinki-NLP/opus-mt-id-en',
    'Helsinki-NLP/opus-mt-en-id',
    'Helsinki-NLP/opus-mt-ja-en',
    'Helsinki-NLP/opus-mt-en-jap',
    'Helsinki-NLP/opus-mt-zh-en',
    'Helsinki-NLP/opus-mt-en-zh',
    'Helsinki-NLP/opus-mt-fr-en',
    'Helsinki-NLP/opus-mt-en-fr',
    'Helsinki-NLP/opus-mt-es-en',
    'Helsinki-NLP/opus-mt-en-es'
]

# Function to download and save the model and tokenizer
def download_and_save_model(model_name, save_dir):
    model = MarianMTModel.from_pretrained(model_name)
    tokenizer = MarianTokenizer.from_pretrained(model_name)
    model.save_pretrained(save_dir + model_name.replace("/", "_"))
    tokenizer.save_pretrained(save_dir + model_name.replace("/", "_"))

# Directory to save models
save_directory = "./mt_pretrained_models/"

# Download and save each model and tokenizer
for model_name in model_names:
    download_and_save_model(model_name, save_directory)
