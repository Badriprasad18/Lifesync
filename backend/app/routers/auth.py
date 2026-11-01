"""Authentication API Router (Register, Login, Me)."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserProfile
from app.schemas.user import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse, UserProfileBase
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegisterRequest, db: Session = Depends(get_db)):
    """Register a new user account and associated baseline profile."""
    # Check if email is already taken
    existing_user = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    # Hash password securely
    hashed_pwd = hash_password(user_in.password)

    # Atomic creation of user and profile
    user = User(
        email=user_in.email.lower().strip(),
        hashed_password=hashed_pwd,
    )
    db.add(user)
    db.flush()  # Generates user.id

    profile = UserProfile(
        user_id=user.id,
        full_name=user_in.full_name.strip(),
        age=user_in.age,
        gender=user_in.gender,
        height_cm=user_in.height_cm,
        weight_kg=user_in.weight_kg,
        occupation=user_in.occupation,
    )
    db.add(profile)
    db.commit()
    db.refresh(user)

    # Issue JWT token
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user,
    )


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLoginRequest, db: Session = Depends(get_db)):
    """Authenticate user credentials and issue signed JWT access token."""
    user = db.query(User).filter(User.email == credentials.email.lower().strip()).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated.",
        )

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user,
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve profile and session details for the currently authenticated user."""
    return current_user


@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_data: UserProfileBase,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update profile attributes for authenticated user."""
    profile = current_user.profile
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    profile.full_name = profile_data.full_name.strip()
    profile.age = profile_data.age
    profile.gender = profile_data.gender
    profile.height_cm = profile_data.height_cm
    profile.weight_kg = profile_data.weight_kg
    profile.occupation = profile_data.occupation.strip() if profile_data.occupation else None

    db.commit()
    db.refresh(current_user)
    return current_user

