from nltk import ngrams, jaccard_distance
import itertools
import json
import sys

# calculate the average ngram-similarity between multiple texts
# efficient implementation making  n! / 2 / (n-2)! comparisons


def avg_jaccard(texts, n):
    cumulative_similarity = 0
    number_of_comparisons = 0
    # calculate Jaccard coefficient
    for (message1, message2) in itertools.combinations(texts, r=2):
        grams = set([element[0] for element in ngrams(message1.split(), n)])
        comparison = [element[0]
                      for element in set(ngrams(message2.split(), n))]
        cumulative_similarity += 1 - jaccard_distance(grams, comparison)
        number_of_comparisons += 1
    # number of comparisons -> Gaussian sum formula
    if number_of_comparisons == 0:
        return 0
    return cumulative_similarity / number_of_comparisons

# extract all messages from a specific user


def messages_from_user(user, messages):
    return [m['text'] for m in messages if (m['sender'].lower() == user.lower())]

# arguments: path to JSON data of conversation and ngram number


def run_eval(path, n):
    file = open(path, "r")
    json_data = json.load(file)
    file.close()

    texts = messages_from_user('AGENT', json_data)
    # final result is being read from stdout
    print(avg_jaccard(texts, n))
    sys.stdout.flush()


run_eval(sys.argv[1], int(sys.argv[2]))
