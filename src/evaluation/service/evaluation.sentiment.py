import sys
import json
import spacy
from spacytextblob.spacytextblob import SpacyTextBlob


def sentimentAnalysis(text):
    nlp = spacy.load('en_core_web_sm')
    nlp.add_pipe('spacytextblob')
    doc = nlp(text)
    return doc._.blob.polarity


def messages_from_user(user, messages):
    return [m['text']
            for m in messages if (m['sender'].lower() == user.lower())]


def run_eval(path):
    file = open(path, "r")
    json_data = json.load(file)
    file.close()

    text = ' '.join(messages_from_user('AGENT', json_data))
    result = sentimentAnalysis(text)
    # final result is being read from stdout
    print(result)
    sys.stdout.flush()


run_eval(sys.argv[1])
