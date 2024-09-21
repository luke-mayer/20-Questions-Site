import boto3
from botocore.exceptions import ClientError
import time
import csv
import random
import json
import uuid
from openai import OpenAI

def initiate_session(thread_id, role, word):
    """Creates a unique session id, inserts it into dynamoDB abe-session-db
        table along with the thread_id for the openai Abe assistant 
        conversation thread, the role Abe is playing, the word used for the
        game, sets the number of questions asked to 0, and the time of session 
        id creation.

    Args:
        thread_id (str): The id for the openai conversation thread for the
            current session.
        role (str): The role that Abe is playing in the game.
        word (str): The word (concrete noun) that either the user or Abe has to
            guess.

    Raises:
        e: ValidationException

    Returns:
        str: The generated session id.
    """
    print("In initiate session")
    # creating dynamodb client
    dynamodb_client = boto3.resource('dynamodb')
    # accessing abe-session-db table
    table = dynamodb_client.Table('abe-session-db')
    # creating session_id using uuid4()
    session_id = str(uuid.uuid4())
    # formatting information to store in abe-session-db
    item = {
        "session_id": session_id,
        "role": role,
        "word": word,
        "question_number": "0",
        "end": "False",
        "created_timestamp": str(time.time()),
        "last_updated_timestamp": str(time.time()),
        "thread_id": thread_id
    }
    
    try:
        response = table.put_item(Item=item)
        print(response)
    except ClientError as e:
        raise e
        
    return session_id

def get_secret(secret_name):
    """Used to retrieve ABE_OPENAI_API_KEY and ABE_OPENAI_ASST_ID which are
        necessary for accessing the OpenAI API and the Abe assistant.

    Args:
        secret_name (str): either abe_openai_api_key or abe_openai_asst_id

    Raises:
        e: ClientError

    Returns:
        JSON: secret key/value pair as a JSON object
    """
    print("in get_secret")
    secret_name = secret_name
    region_name = "us-east-1"

    # Create a Secrets Manager client
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        # For a list of exceptions thrown, see
        # https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        raise e

    return json.loads(get_secret_value_response['SecretString'])

def respond(err, res=None):
    """Response handler that also determines HTTP response based on if there are
        Exceptions or not.

    Args:
        err (Exception or False): Exception if one is caught.
        res (JSON, optional): Response body. Defaults to None.

    Returns:
        JSON: HTTP response code and response body.
    """
    
    return {
        "statusCode": "500" if err else "201",
        "body": str(err) if err else json.dumps(res),
        "headers": {
            "Content-Type": "application/json",
        },
    }

def lambda_handler(event, context):
    """Initializes 20 Questions game including assigning Abe, the OpenAI 
        assistant, the role of either answerer or questioner. If answerer, 
        generates random word (concrete noun) and provides it to Abe.

    Args:
        event (JSON): Input from HTTP API Gateway, should include Abe's role.
        context (JSON): Not utilized.

    Returns:
        JSON: HTTP response code and response body.
    """
    try:
       # print("Received event: ", json.dumps(event))
        #if (event["headers"]["mock"]):
           # return respond(False, {
           #     "session_id": "mock_session_id",
            #    "question_number": "99",
            #    "response": "Mock response",
           # })
        
        ABE_OPENAI_API_KEY = get_secret("abe_openai_api_key")['ABE_OPENAI_API_KEY']
        ABE_OPENAI_ASST_ID = get_secret("abe_openai_asst_id")['ABE_OPENAI_ASST_ID']
        
        # Accessing OpenAi API
        client = OpenAI(api_key=ABE_OPENAI_API_KEY)
        # Retrieving assistant Abe
        abe = client.beta.assistants.retrieve(ABE_OPENAI_ASST_ID)
        # Creating new thread (conversation with assistant)
        thread = client.beta.threads.create()
        
        # Need to setup retrieval of role from given HTTP event later
        
        role = event['headers']["role"]
        print("Role: ", role)
        if (role == "answerer"): 
            print("in if role")
            # Generating random word (concrete noun) that user will try to guess
            with open("words.csv", "r") as words_file:
                csv_reader = csv.reader(words_file)
                word = random.choice([line[0] for line in csv_reader])
                word = str(word)
            print(word)
            
            initial_prompt = "You are the answerer. Your object for this game is a(n) "
            initial_prompt += word
            initial_prompt += "."
        
        else: # To be filled in later
            initial_prompt = "You are the questioner."
            word = event["word"]
            
        # Creating and storing session info including Abe role and chosen word
        session_id = initiate_session(thread.id, role, word)
        
        # Sending initial prompt to assistant
        message = client.beta.threads.messages.create(
            thread_id=thread.id,
            role="user",
            content=initial_prompt
        )
        
        # Starting initial run (conversation with assistant)
        run = client.beta.threads.runs.create_and_poll(
        thread_id=thread.id,
        assistant_id=abe.id
        )
        
        while run.status != "completed":
            time.sleep(0.5)
            run = client.beta.threads.runs.create_and_poll(
                thread_id=thread.id,
                run_id=run.id
            )
        messages = client.beta.threads.messages.list(
            thread_id=thread.id
        )
        
        # retrieving response from assistant
        response = {
            "session_id": session_id,
            "question_number": "0",
            "response": messages.data[0].content[0].text.value,
            "word": word,
        }
        
        return respond(False, response)
    except Exception as err:
        print("In lambda_function except:", err)
        print(err)
        return respond(err)