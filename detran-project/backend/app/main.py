import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

class AnswerSubmission(BaseModel):
    user_id: str
    question_id: int
    is_correct: bool

@app.get("/topics")
def get_topics():
    response = supabase.table("topics").select("*").order("id").execute()
    return response.data

@app.get("/topics/{topic_id}/subtopics")
def get_subtopics(topic_id: int):
    response = supabase.table("subtopics").select("*").eq("topic_id", topic_id).execute()
    return response.data

@app.get("/questions")
def get_questions(user_id: str, topic_id: Optional[int] = None, subtopic_id: Optional[int] = None):
    query = supabase.table("questions").select("*")
    
    if subtopic_id:
        query = query.eq("subtopic_id", subtopic_id)
    elif topic_id:
        query = query.eq("topic_id", topic_id)
    
    questions_data = query.execute().data
    
    progress = supabase.table("user_progress").select("question_id").eq("user_id", user_id).eq("is_correct", True).execute()
    answered_ids = [item['question_id'] for item in progress.data]
    
    available_questions = [q for q in questions_data if q['id'] not in answered_ids]
    
    return available_questions

@app.get("/stats")
def get_stats(user_id: str, topic_id: Optional[int] = None, subtopic_id: Optional[int] = None):
    query = supabase.table("user_progress").select("is_correct, question_id, questions(topic_id, subtopic_id)").eq("user_id", user_id)
    
    data = query.execute().data
    
    if subtopic_id:
        data = [d for d in data if d['questions'] and d['questions']['subtopic_id'] == subtopic_id]
    elif topic_id:
        data = [d for d in data if d['questions'] and d['questions']['topic_id'] == topic_id]
        
    correct = len([d for d in data if d['is_correct']])
    wrong = len([d for d in data if not d['is_correct']])
    
    return {"correct": correct, "wrong": wrong}

@app.post("/submit")
def submit_answer(submission: AnswerSubmission):
    data = {
        "user_id": submission.user_id,
        "question_id": submission.question_id,
        "is_correct": submission.is_correct
    }
    supabase.table("user_progress").insert(data).execute()
    return {"status": "success"}