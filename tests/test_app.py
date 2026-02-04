import pytest
from fastapi.testclient import TestClient
from src.app import app, activities
from urllib.parse import quote

client = TestClient(app)


def test_get_activities():
    r = client.get("/activities")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, dict)
    # a known seeded activity should exist
    assert "Chess Club" in data


def test_signup_and_remove_participant():
    activity = "Swimming Club"
    email = "testuser+signup@example.com"

    # ensure a clean start (remove if present)
    if email in activities[activity]["participants"]:
        activities[activity]["participants"].remove(email)

    # Sign up (URL-encode the email so '+' is preserved)
    r = client.post(f"/activities/{activity}/signup?email={quote(email)}")
    assert r.status_code == 200
    assert "Signed up" in r.json()["message"]

    # Check participant appears
    r2 = client.get("/activities")
    assert email in r2.json()[activity]["participants"]

    # Duplicate signup should be rejected
    r_dup = client.post(f"/activities/{activity}/signup?email={quote(email)}")
    assert r_dup.status_code == 400

    # Remove participant
    r3 = client.post(f"/activities/{activity}/remove?email={quote(email)}")
    assert r3.status_code == 200
    assert "Removed" in r3.json()["message"]

    # Ensure participant is gone
    r4 = client.get("/activities")
    assert email not in r4.json()[activity]["participants"]

    # Removing again should return 404
    r5 = client.post(f"/activities/{activity}/remove?email={quote(email)}")
    assert r5.status_code == 404
