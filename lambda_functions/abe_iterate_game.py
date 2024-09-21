import boto3
from botocore.exceptions import ClientError
import time
import json
from openai import OpenAI

def iterate_question_number(session_id):
    """Used to retrieve and update the current question number from dynamodb
        table.

    Args:
        session_id (str): current session id.

    Raises:
        e: ValidationException
    """
    print("In get_stream_id")
    # Creating dynamodb client
    dynamodb_client = boto3.resource('dynamodb')
    # Accessing abe-session-db table
    table = dynamodb_client.Table('abe-session-db')
    
    try:
        # Retrieving stream id
        item = table.get_item(Key={
            'session_id': session_id
        })
        
        # Iterating question number
        question_number = int(item['Item']['question_number'])
        question_number += 1
        
        # Updated question_number
        table.update_item(
            Key={'session_id': session_id},
            UpdateExpression="set question_number=:q, last_updated_timestamp=:l",
            ExpressionAttributeValues={
                ":q": str(question_number), 
                ":l": str(time.time())
            },
            ReturnValues="UPDATED_NEW"
        )
        
    except ClientError as e:
        print(e)
        raise e
    return question_number

def get_stream_id(session_id):
    """Used to retrieve the openai Thread id associated with the current
        session from a dynamodb table.

    Args:
        session_id (str): current session id.

    Raises:
        e: ValidationException

    Returns:
        str: thread id for current conversation.
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
    
    return (item['Item']['thread_id'])

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
        "body": err.message if err else json.dumps(res),
        "headers": {
            "Content-Type": "application/json",
        },
    }

def lambda_handler(event, context):
    """Retrieves user prompt, relays it to assistant, and retrieves and returns
        assistant response.

    Args:
        event (JSON): Input from HTTP API Gateway, should include user 
            prompt.
        context (JSON): Not utilized.

    Returns:
        JSON: HTTP response code and response body.
    """
    try:
        # print("Received event: ", json.dumps(event))
        # if (event["headers"]["mock"]):
         #    return respond(False, {
          #       "session_id": "mock_session_id",
           #      "question_number": "99",
           #      "response": "Mock response",
           #  })
        
        ABE_OPENAI_API_KEY = get_secret("abe_openai_api_key")['ABE_OPENAI_API_KEY']
        ABE_OPENAI_ASST_ID = get_secret("abe_openai_asst_id")['ABE_OPENAI_ASST_ID']
        
        # retrieving prompt
        print("Event: ", event)
        body = event["body"]
        print("Body: ", body)
        body = json.loads(body)
        print("Body after loads: ", body)
        user_prompt = body['prompt']
        if not user_prompt:
            return {
            "statusCode": "400",
            "body": "Bad prompt",
            "headers": {
                "Content-Type": "application/json",
            },
        }
        
        # Accessing OpenAi API
        client = OpenAI(api_key=ABE_OPENAI_API_KEY)
        # Retrieving assistant Abe
        abe = client.beta.assistants.retrieve(ABE_OPENAI_ASST_ID)
        
        session_id = body['session_id']
        # retrieving thread id
        thread_id = get_stream_id(session_id)
        # Iterating question Number
        question_number = iterate_question_number(session_id)
        print("Question number:", question_number)
        
        # Sending initial prompt to assistant
        message = client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=user_prompt
        )
        
        # Starting initial run (conversation with assistant)
        run = client.beta.threads.runs.create_and_poll(
        thread_id=thread_id,
        assistant_id=abe.id
        )
        
        while run.status != "completed":
            time.sleep(0.5)
            run = client.beta.threads.runs.create_and_poll(
                thread_id=thread_id,
                run_id=run.id
            )
        messages = client.beta.threads.messages.list(
            thread_id=thread_id
        )
        
        # retrieving response from assistant
        response = {
            "session_id": session_id,
            "question_number": question_number,
            "response": messages.data[0].content[0].text.value
            }
        
        return respond(False, response)
    except Exception as err:
        print("In lambda_function except:", err)
        print(err)
        return respond(err)