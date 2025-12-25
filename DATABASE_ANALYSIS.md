# Database Models - Scalability & Performance Analysis

## Overall Assessment: **GOOD** with some improvements needed

---

## ✅ **STRENGTHS**

1. **Good Index Coverage** - Most models have proper indexes
2. **Proper Normalization** - Account/Business separation is excellent
3. **Analytics Caching** - AnalyticsSnapshot model for performance
4. **Usage Tracking** - Unified UsageTracker model
5. **Compound Indexes** - Most common query patterns are indexed

---

## ⚠️ **CRITICAL ISSUES TO FIX**

### 1. **Invoice Model** - Missing Text Index for Search

**Problem:**
```javascript
// Current query uses regex on invoiceId (SLOW)
query.invoiceId = { $regex: search, $options: "i" };
```

**Fix:**
```javascript
// Add text index for invoiceId search
InvoiceSchema.index({ invoiceId: "text" });
// OR use compound text index
InvoiceSchema.index({ invoiceId: "text", business: 1 });
```

**Impact:** High - Search queries will be slow without this

---

### 2. **Invoice Model** - Missing Compound Index for Common Query

**Problem:**
Common query pattern: `find({ business, status }).sort({ createdAt: -1 })`

**Current Indexes:**
- `{ business: 1, status: 1 }` ❌ Missing createdAt
- `{ business: 1, createdAt: -1 }` ❌ Missing status

**Fix:**
```javascript
// Add compound index matching query pattern
InvoiceSchema.index({ business: 1, status: 1, createdAt: -1 });
```

**Impact:** Medium - Sorting will be slower on large datasets

---

### 3. **Feedback Model** - Redundant Fields

**Problem:**
Both `invoice` and `invoiceId` fields exist (backward compatibility)

**Fix:**
- Remove `invoiceId` after migration
- Or add index: `FeedbackSchema.index({ invoiceId: 1 });` if keeping

**Impact:** Low - Minor storage overhead

---

### 4. **Customer Model** - Unique Index Issue

**Problem:**
```javascript
CustomerSchema.index({ business: 1, customerEmail: 1 }, { unique: true });
```
This will fail if `customerEmail` is `null` (multiple nulls violate unique constraint)

**Fix:**
```javascript
// Use sparse index for unique constraint with nulls
CustomerSchema.index(
  { business: 1, customerEmail: 1 },
  { unique: true, sparse: true }
);
```

**Impact:** Medium - Will cause errors if multiple customers have null email

---

### 5. **Customer Model** - Missing Text Index for Name Search

**Problem:**
If you search customers by name, regex will be slow

**Fix:**
```javascript
CustomerSchema.index({ customerName: "text" });
// OR compound
CustomerSchema.index({ business: 1, customerName: "text" });
```

**Impact:** Low - Only if you implement customer search

---

### 6. **Coupon Model** - Missing Optimal Compound Index

**Problem:**
Common query: Find active, unused coupons for business, not expired

**Current:**
```javascript
CouponSchema.index({ business: 1, isActive: 1, expiryDate: 1 });
```

**Better:**
```javascript
// Add isUsed to compound index
CouponSchema.index({ business: 1, isActive: 1, isUsed: 1, expiryDate: 1 });
```

**Impact:** Medium - Coupon queries will be slower

---

### 7. **Usage Tracker** - Partial Unique Index May Not Work

**Problem:**
```javascript
UsageTrackerSchema.index(
  { business: 1, usageType: 1 },
  {
    unique: true,
    partialFilterExpression: { usageType: "invoice-upload" },
  }
);
```

**Issue:** Partial indexes in MongoDB work, but ensure it's correct

**Fix:** Verify this works, or use application-level constraint

**Impact:** Low - Should work, but verify

---

### 8. **Activity Log** - Missing TTL Index

**Problem:**
Activity logs will grow indefinitely, causing performance issues

**Fix:**
```javascript
// Auto-delete logs older than 90 days
ActivityLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 }
);
```

**Impact:** High - Collection will grow unbounded without this

---

### 9. **Activity Log** - Missing Compound Index

**Problem:**
Common query: `find({ business, actionType }).sort({ createdAt: -1 })`

**Fix:**
```javascript
ActivityLogSchema.index({ business: 1, actionType: 1, createdAt: -1 });
```

**Impact:** Medium - Activity log queries will slow down

---

### 10. **Invoice Email** - Missing Compound Index

**Problem:**
Common query: Find emails by business and status

**Fix:**
```javascript
InvoiceEmailSchema.index({ business: 1, deliveryStatus: 1, sentAt: -1 });
```

**Impact:** Low - Only if you query by status frequently

---

## 📊 **SCALABILITY CONCERNS**

### 1. **Invoice Collection Growth**
- **Risk:** High - Will grow fastest
- **Solution:** 
  - Add TTL index for old invoices (optional)
  - Archive old invoices to separate collection
  - Use pagination (already doing ✅)

### 2. **Feedback Collection Growth**
- **Risk:** Medium - Grows with invoices
- **Solution:**
  - Already using pagination ✅
  - Consider archiving old feedback

### 3. **Activity Log Growth**
- **Risk:** High - Can grow very fast
- **Solution:**
  - Add TTL index (CRITICAL - see issue #8)
  - Consider separate collection for old logs

### 4. **Usage Tracker Growth**
- **Risk:** Medium - AI usage events will accumulate
- **Solution:**
  - Add TTL index for old AI usage events
  - Keep only last 6 months of AI usage history

### 5. **Analytics Snapshot**
- **Risk:** Low - Already optimized ✅
- **Solution:** None needed, well designed

---

## 🔧 **RECOMMENDED FIXES (Priority Order)**

### **HIGH PRIORITY** (Do Immediately)

1. ✅ Add TTL index to ActivityLog (auto-cleanup)
2. ✅ Add text index to Invoice for invoiceId search
3. ✅ Fix Customer unique index (add sparse: true)
4. ✅ Add compound index: Invoice `{ business: 1, status: 1, createdAt: -1 }`

### **MEDIUM PRIORITY** (Do Soon)

5. ✅ Add compound index: Coupon `{ business: 1, isActive: 1, isUsed: 1, expiryDate: 1 }`
6. ✅ Add compound index: ActivityLog `{ business: 1, actionType: 1, createdAt: -1 }`
7. ✅ Add TTL index to UsageTracker for AI usage events (6 months)

### **LOW PRIORITY** (Nice to Have)

8. ✅ Add text index to Customer for name search (if implementing search)
9. ✅ Add compound index: InvoiceEmail `{ business: 1, deliveryStatus: 1, sentAt: -1 }`
10. ✅ Remove redundant `invoiceId` field from Feedback after migration

---

## 📈 **PERFORMANCE OPTIMIZATION OPPORTUNITIES**

### 1. **Denormalization Opportunities**

**Current:** Customer data embedded in Invoice.customerDetails
**Consider:** Keep both for:
- Fast reads (embedded)
- Relationship tracking (reference)

**Verdict:** ✅ Current approach is good (hybrid)

---

### 2. **Query Optimization**

**Dashboard Metrics:**
- ✅ Using AnalyticsSnapshot (excellent!)
- ✅ Consider pre-aggregating more metrics

**Invoice List:**
- ✅ Using pagination
- ⚠️ Regex search on invoiceId needs text index

**Feedback List:**
- ✅ Using pagination
- ✅ Using $in for batch lookups

---

### 3. **Index Strategy**

**Current Index Count:**
- Account: 4 indexes ✅
- Business: 3 indexes ✅
- Invoice: 7 indexes ✅ (needs 1 more)
- Feedback: 5 indexes ✅
- Customer: 4 indexes ⚠️ (needs sparse fix)
- Coupon: 5 indexes ⚠️ (needs 1 more)
- Subscription: 5 indexes ✅
- Payment: 6 indexes ✅
- UsageTracker: 5 indexes ✅
- AnalyticsSnapshot: 3 indexes ✅
- InvoiceEmail: 5 indexes ⚠️ (could add 1)
- RecommendedAction: 3 indexes ✅
- ActivityLog: 4 indexes ⚠️ (needs TTL + 1 more)
- DeletedAccount: 2 indexes ✅
- PlatformReview: 1 index ✅

**Total:** ~60 indexes (reasonable for 15 models)

---

## 🎯 **FINAL VERDICT**

### **Scalability Score: 8/10**

**Strengths:**
- ✅ Well-normalized schema
- ✅ Good index coverage
- ✅ Proper separation of concerns
- ✅ Analytics caching implemented
- ✅ Pagination used

**Weaknesses:**
- ⚠️ Missing text indexes for search
- ⚠️ Some missing compound indexes
- ⚠️ No TTL indexes for log cleanup
- ⚠️ Customer unique index issue

**Recommendation:**
Fix the HIGH PRIORITY issues immediately. The database design is solid and will scale well with these fixes.

---

## 📝 **ACTION ITEMS**

1. [ ] Add text index to Invoice.invoiceId
2. [ ] Add TTL index to ActivityLog (90 days)
3. [ ] Fix Customer unique index (add sparse: true)
4. [ ] Add compound index to Invoice: { business: 1, status: 1, createdAt: -1 }
5. [ ] Add compound index to Coupon: { business: 1, isActive: 1, isUsed: 1, expiryDate: 1 }
6. [ ] Add compound index to ActivityLog: { business: 1, actionType: 1, createdAt: -1 }
7. [ ] Add TTL index to UsageTracker for AI events (6 months)
8. [ ] Monitor index usage and remove unused indexes

---

**Last Updated:** $(date)
**Models Analyzed:** 15
**Issues Found:** 10
**Critical Issues:** 4

