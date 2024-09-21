import boto3
from botocore.exceptions import ClientError
import time
import json
from openai import OpenAI

def get_session_data(session_id):
    """Used to retrieve the current session data from dynamodb table.

    Args:
        session_id (str): current session id.

    Raises:
        e: ValidationException

    Returns:
        dict: session data.
    """
    print("In get_stream_id")
    # creating dynamodb client
    dynamodb_client = boto3.resource('dynamodb')
    # accessing abe-session-db table
    table = dynamodb_client.Table('abe-session-db')
    
    try:
        # retrieving stream id
        item = table.get_item(Key={
            'session_id': session_id
        })
    except Exception as e:
        print(e)
        raise e
    
    return item

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
        "statusCode": "500" if err else "200",
        "body": str(err) if err else json.dumps(res),
        "headers": {
            "Content-Type": "application/json",
        },
    }

def lambda_handler(event, context):
    """If Abe is answerer, retrieves user guess and determines if it is correct
    or not. If Abe is the questioner, processes if player indicates if Abe is 
    correct or not.

    Args:
        event (JSON): Input from HTTP API Gateway, should include user 
            prompt.
        context (JSON): Not utilized.

    Returns:
        JSON: HTTP response code and response body.
    """
    try:
        #print("Received event: ", json.dumps(event))
        #if (event["headers"]["mock"]):
            #return respond(False, {
             #   "session_id": "mock_session_id",
              #  "response": "Mock response"
            #})
        
        ABE_OPENAI_API_KEY = get_secret("abe_openai_api_key")['ABE_OPENAI_API_KEY']
        ABE_OPENAI_ASST_ID = get_secret("abe_openai_asst_id")['ABE_OPENAI_ASST_ID']
        
       # retrieving guess
        print("Event: ", event)
        body = event["body"]
        print("Body: ", body)
        body = json.loads(body)
        print("Body after loads: ", body)
        user_guess = body['guess']
        if not user_guess:
            return {
                "statusCode": "400",
                "body": "Bad input",
                "headers": {
                    "Content-Type": "application/json",
                },
            }
        
        # Accessing OpenAi API
        client = OpenAI(api_key=ABE_OPENAI_API_KEY)
        # Retrieving assistant Abe
        abe = client.beta.assistants.retrieve(ABE_OPENAI_ASST_ID)
            
        # Retrieving session data
        print(body['session_id'])
        session_data = get_session_data(body['session_id'])
        thread_id = session_data['Item']['thread_id']
        question_number = session_data['Item']['question_number']
        role = session_data['Item']['role']
        
        if role == "answerer":
            user_guess = user_guess.strip()
            user_guess = user_guess.lower()
            
            word = session_data['Item']['word']
            word = word.strip()
            word = word.lower()
            
            if user_guess == word:
                body = "true"
                response = {
                    "response": body,
                }
            else:
                body = "false"
                response = {
                    "response": body,
                }
        else:
            correct = session_data['Item']['correct']
            correct = bool(correct)
            if correct:
                body = '''Abe has successfully identified your word after %s 
                    questions.''', question_number
                response = {
                    "response": body,
                }
            else:
                body = ""
                response = {
                    "response": body,
                }
        
        return respond(False,response)
    except Exception as err:
        print("In lambda_function except:", err)
        print(err)
        return respond(err)