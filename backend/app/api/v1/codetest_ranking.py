"""
API endpoints for coding test ranking/statistics dashboard.
"""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc, case
from datetime import datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel
from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.codetest import Submission, Problem

router = APIRouter()

# ============ Schemas ============

class CodetestRankingItem(BaseModel):
    user_id: int
    nickname: str
    total_submissions: int
    correct_rate: float
    last_active_at: Optional[datetime]
    rank: int
    score: float
    difficulty_breakdown: dict

class CodetestRankingResponse(BaseModel):
    rankings: List[CodetestRankingItem]
    period: str

class CodetestUserStats(BaseModel):
    user_id: int
    nickname: str
    total_submissions: int
    correct_rate: float
    last_active_at: Optional[datetime]
    rank: int
    score: float
    difficulty_breakdown: dict

# ============ Helper ============

def get_period_range(period: str) -> datetime:
    now = datetime.utcnow()
    if period == "month":
        return now - timedelta(days=30)
    elif period == "semester":
        # Assume semester = 6 months
        return now - timedelta(days=180)
    return None  # all

# ============ Endpoints ============

@router.get("/rankings", response_model=CodetestRankingResponse)
async def get_codingtest_rankings(
    period: str = Query("all", regex="^(all|semester|month)$"),
    db: AsyncSession = Depends(get_db),
):
    since = get_period_range(period)
    submission_query = select(
        Submission.user_id,
        func.count(Submission.id).label("total_submissions"),
        func.sum(case((Submission.result == "correct", 1), else_=0)).label("correct_count"),
        func.max(Submission.submitted_at).label("last_active_at")
    )
    if since:
        submission_query = submission_query.where(Submission.submitted_at >= since)
    submission_query = submission_query.group_by(Submission.user_id)
    submission_query = submission_query.order_by(desc("correct_count"), desc("total_submissions"))
    result = await db.execute(submission_query)
    rows = result.fetchall()

    rankings = []
    for idx, row in enumerate(rows, 1):
        user = await db.get(User, row.user_id)
        if not user:
            continue
        # 난이도별 분포
        diff_query = select(
            Problem.difficulty,
            func.count(Submission.id)
        ).join(Problem, Submission.problem_id == Problem.id)
        if since:
            diff_query = diff_query.where(Submission.submitted_at >= since)
        diff_query = diff_query.where(Submission.user_id == row.user_id)
        diff_query = diff_query.group_by(Problem.difficulty)
        diff_result = await db.execute(diff_query)
        diff_breakdown = {d: c for d, c in diff_result.fetchall()}
        total = row.total_submissions or 1
        correct_rate = (row.correct_count or 0) / total * 100
        rankings.append(CodetestRankingItem(
            user_id=row.user_id,
            nickname=user.name,
            total_submissions=row.total_submissions,
            correct_rate=correct_rate,
            last_active_at=row.last_active_at,
            rank=idx,
            score=row.correct_count or 0,
            difficulty_breakdown=diff_breakdown
        ))
    return CodetestRankingResponse(rankings=rankings, period=period)

@router.get("/user-stats", response_model=CodetestUserStats)
async def get_codingtest_user_stats(
    user_id: int,
    period: str = Query("all", regex="^(all|semester|month)$"),
    db: AsyncSession = Depends(get_db),
):
    since = get_period_range(period)
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    submission_query = select(
        func.count(Submission.id).label("total_submissions"),
        func.sum(case((Submission.result == "correct", 1), else_=0)).label("correct_count"),
        func.max(Submission.submitted_at).label("last_active_at")
    ).where(Submission.user_id == user_id)
    if since:
        submission_query = submission_query.where(Submission.submitted_at >= since)
    result = await db.execute(submission_query)
    row = result.first()
    diff_query = select(
        Problem.difficulty,
        func.count(Submission.id)
    ).join(Problem, Submission.problem_id == Problem.id)
    if since:
        diff_query = diff_query.where(Submission.submitted_at >= since)
    diff_query = diff_query.where(Submission.user_id == user_id)
    diff_query = diff_query.group_by(Problem.difficulty)
    diff_result = await db.execute(diff_query)
    diff_breakdown = {d: c for d, c in diff_result.fetchall()}
    total = row.total_submissions or 1
    correct_rate = (row.correct_count or 0) / total * 100
    return CodetestUserStats(
        user_id=user_id,
        nickname=user.name,
        total_submissions=row.total_submissions or 0,
        correct_rate=correct_rate,
        last_active_at=row.last_active_at,
        rank=0,  # 랭킹은 별도 API에서 계산
        score=row.correct_count or 0,
        difficulty_breakdown=diff_breakdown
    )
