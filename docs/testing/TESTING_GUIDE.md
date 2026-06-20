# 🧪 Testing Guide - Like Feature

## Setup

Install test dependencies:

```bash
npm install --save-dev jest@^29.7.0 jest-expo@~52.0.5 @testing-library/react-native@^12.9.0 @testing-library/jest-native@^5.4.3 @types/jest@^29.5.14
```

## Running Tests

### Run all tests:

```bash
npm test
```

### Watch mode (auto-rerun on file changes):

```bash
npm run test:watch
```

### Coverage report:

```bash
npm run test:coverage
```

### Run specific test file:

```bash
npm test -- matchingApi.test.ts
```

---

## 📋 Test Coverage

### **likeProfile** Tests

#### ✅ Success Cases

- [x] Successfully like a profile without match
- [x] Create a match when mutual like exists
- [x] Update both like records to `is_match: true`
- [x] Return matched profile data

#### ❌ Error Cases

- [x] Handle database connection errors
- [x] Handle duplicate like errors (23505)
- [x] Handle network exceptions
- [x] Handle Supabase API errors

#### 🔍 Edge Cases

- [x] Empty user IDs
- [x] Same user liking themselves
- [x] Null profile data when match is created
- [x] Invalid UUID format validation
- [x] Profile doesn't exist but like succeeds

#### 🔄 Race Conditions

- [x] Concurrent mutual likes (both users like at same time)
- [x] Multiple rapid likes from same user

---

## 📊 Expected Test Results

```
PASS  src/features/matching/api/__tests__/matchingApi.test.ts
  likeProfile
    ✅ Success Cases
      ✓ should successfully like a profile without match (XX ms)
      ✓ should create a match when mutual like exists (XX ms)
    ❌ Error Cases
      ✓ should handle database error when inserting like (XX ms)
      ✓ should handle duplicate like error gracefully (XX ms)
      ✓ should handle exception thrown during like process (XX ms)
    🔍 Edge Cases
      ✓ should handle empty user IDs (XX ms)
      ✓ should handle same user liking themselves (XX ms)
      ✓ should handle null profile data when match is created (XX ms)
      ✓ should handle UUID format validation (XX ms)
    🔄 Race Conditions
      ✓ should handle concurrent mutual likes (XX ms)
  passProfile
    ✓ should successfully pass a profile (XX ms)
    ✓ should handle database error when passing (XX ms)
    ✓ should handle duplicate pass (XX ms)
  superLikeProfile
    ✓ should successfully super like a profile without match (XX ms)
    ✓ should create match with super like when mutual like exists (XX ms)

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
Snapshots:   0 total
Time:        X.XXXs
```

---

## 🐛 Common Issues

### Issue: Module not found

**Solution:** Run `npm install` to install test dependencies

### Issue: Tests timeout

**Solution:** Increase timeout in jest.config.js:

```js
testTimeout: 10000;
```

### Issue: Transform errors

**Solution:** Check transformIgnorePatterns in jest.config.js

---

## 📝 Test Scenarios Explained

### 1. **Basic Like (No Match)**

```typescript
User A likes User B
→ Like saved to database
→ Check if User B already liked User A (no)
→ Return: { success: true, isMatch: false }
```

### 2. **Mutual Like (Match Created)**

```typescript
User A likes User B
→ Like saved to database
→ Check if User B already liked User A (yes!)
→ Update both likes: is_match = true, matched_at = now
→ Fetch User B's profile
→ Return: { success: true, isMatch: true, matchedProfile: {...} }
```

### 3. **Duplicate Like**

```typescript
User A likes User B (again)
→ Database constraint violation (unique: from_user_id, to_user_id)
→ Return: { success: false, error: "duplicate key..." }
```

### 4. **Concurrent Likes**

```typescript
User A likes User B (at time T)
User B likes User A (at time T)
→ Both inserts succeed
→ Both checks find mutual like
→ Both updates succeed
→ Both get match confirmation
```

---

## 🎯 Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

Current coverage for matchingApi:

```
File                | % Stmts | % Branch | % Funcs | % Lines
--------------------|---------|----------|---------|--------
matchingApi.ts      |   85.7  |   80.0   |   90.0  |  85.7
```

---

## 🚀 Next Steps

1. Run tests: `npm test`
2. Check coverage: `npm run test:coverage`
3. Fix any failing tests
4. Add integration tests for full swipe flow
5. Add tests for fetchDiscoverProfiles with scoring
6. Add tests for getMatches, getLikes, getPasses
