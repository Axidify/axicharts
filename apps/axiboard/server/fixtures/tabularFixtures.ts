/** C161 golden contract fixtures — pipe-delimited tabular samples. */

export const LEDGER_CSV = `| Date       | Transaction ID | Account             | Category       | Description                 | Customer/Vendor | Debit (RM) | Credit (RM) | Balance (RM) | Payment Method | Invoice No   | Cost Center |
| ---------- | -------------- | ------------------- | -------------- | --------------------------- | --------------- | ---------: | ----------: | -----------: | -------------- | ------------ | ----------- |
| 2026-07-01 | TRX0001        | Cash                | Sales          | Website Development         | Alpha Sdn Bhd   |       0.00 |    8,500.00 |    18,500.00 | Bank Transfer  | INV-2026-001 | IT Services |
| 2026-07-02 | TRX0002        | Bank                | Office Expense | Office Rent July            | KL Property     |   3,500.00 |        0.00 |    15,000.00 | Bank Transfer  | BILL-001     | Admin       |
| 2026-07-02 | TRX0003        | Bank                | Utilities      | Internet Subscription       | TIME            |     199.00 |        0.00 |    14,801.00 | Auto Debit     | BILL-002     | Admin       |
| 2026-07-03 | TRX0004        | Bank                | Salary         | July Payroll                | Staff Payroll   |  18,500.00 |        0.00 |    -3,699.00 | Bank Transfer  | PAY-001      | HR          |
| 2026-07-04 | TRX0005        | Accounts Receivable | Sales          | Mobile App Development      | Beta Holdings   |       0.00 |   25,000.00 |    21,301.00 | Invoice        | INV-2026-002 | Development |
| 2026-07-05 | TRX0006        | Bank                | Software       | Microsoft 365               | Microsoft       |     320.00 |        0.00 |    20,981.00 | Credit Card    | BILL-003     | IT          |
| 2026-07-06 | TRX0007        | Bank                | Software       | GitHub Team                 | GitHub          |     180.00 |        0.00 |    20,801.00 | Credit Card    | BILL-004     | IT          |
| 2026-07-06 | TRX0008        | Bank                | Marketing      | Google Ads                  | Google          |   2,400.00 |        0.00 |    18,401.00 | Credit Card    | BILL-005     | Marketing   |
| 2026-07-08 | TRX0009        | Bank                | Sales          | Maintenance Contract        | Gamma Logistics |       0.00 |   12,000.00 |    30,401.00 | Bank Transfer  | INV-2026-003 | Support     |
| 2026-07-09 | TRX0010        | Bank                | Travel         | Client Meeting Johor        | Petronas        |     180.00 |        0.00 |    30,221.00 | Corporate Card | EXP-001      | Sales       |
| 2026-07-10 | TRX0011        | Accounts Payable    | Hardware       | Dell Monitor                | Dell            |   1,200.00 |        0.00 |    29,021.00 | Bank Transfer  | BILL-006     | IT          |
| 2026-07-12 | TRX0012        | Bank                | Sales          | Performance Testing Service | Johor Port      |       0.00 |   18,000.00 |    47,021.00 | Bank Transfer  | INV-2026-004 | Consulting  |
| 2026-07-14 | TRX0013        | Bank                | Insurance      | Company Insurance           | Allianz         |   1,450.00 |        0.00 |    45,571.00 | Auto Debit     | BILL-007     | Admin       |
| 2026-07-15 | TRX0014        | Bank                | Fuel           | Company Vehicle             | Shell           |     250.00 |        0.00 |    45,321.00 | Fleet Card     | EXP-002      | Operations  |
| 2026-07-16 | TRX0015        | Bank                | Sales          | AI Consultation             | Delta Tech      |       0.00 |    6,800.00 |    52,121.00 | Bank Transfer  | INV-2026-005 | Consulting  |`;

export const SALES_CSV = `| Opportunity ID | Customer          | Salesperson | Stage       | Value (RM) | Probability | Expected Close | Source          |
| -------------- | ----------------- | ----------- | ----------- | ---------: | ----------: | -------------- | --------------- |
| OPP-001        | ABC Manufacturing | Amir        | Proposal    |     85,000 |         70% | 2026-08-15     | Referral        |
| OPP-002        | Johor Port        | Sarah       | Negotiation |    240,000 |         90% | 2026-07-28     | Existing Client |
| OPP-003        | XYZ Logistics     | Amir        | Discovery   |     45,000 |         30% | 2026-09-05     | Website         |
| OPP-004        | Delta Tech        | Jason       | Closed Won  |     68,000 |        100% | 2026-07-10     | Cold Call       |
| OPP-005        | Alpha Solutions   | Amir        | Qualified   |    120,000 |         50% | 2026-08-22     | LinkedIn        |`;

export const ATTENDANCE_CSV = `| Employee ID | Name        | Department | Date       | Clock In | Clock Out | Hours | Status  |
| ----------- | ----------- | ---------- | ---------- | -------- | --------- | ----: | ------- |
| EMP001      | Amir Hamzah | IT         | 2026-07-18 | 08:52    | 18:10     |   9.3 | Present |
| EMP002      | Sarah Lim   | HR         | 2026-07-18 | 09:03    | 17:58     |   8.9 | Present |
| EMP003      | Jason Tan   | Sales      | 2026-07-18 | -        | -         |     0 | Leave   |
| EMP004      | Nurul       | Finance    | 2026-07-18 | 08:45    | 17:47     |   9.0 | Present |`;

export const INVENTORY_CSV = `| SKU | Product | Stock | Reorder Level | Unit Cost | Unit Price |
| WIDGET-01 | Steel Bolt M8 | 120 | 50 | 0.45 | 1.20 |
| WIDGET-02 | Rubber Gasket | 18 | 40 | 2.10 | 5.50 |
| WIDGET-03 | Copper Wire 2mm | 8 | 25 | 12.00 | 28.00 |
| WIDGET-04 | Plastic Housing | 95 | 30 | 3.75 | 9.99 |`;
