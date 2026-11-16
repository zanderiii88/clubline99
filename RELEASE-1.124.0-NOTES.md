# CLUBLINE 99 v1.124.0 - clearer cash planning and career checks

Financial forecasts now use the same calculation in the main finance screen, Streamlined budget, transfer reviews and board assessment. They include weekly wages, club running costs, facility upkeep and commercial income for the current division. The screens show the weekly change before match income, the resulting four-week balance and how many full weekly bills current cash covers. Transfer reviews calculate this again using the proposed fee and wage and warn when the deal would leave a negative four-week balance.

The existing four-payroll transfer allowance remains a separate conservative guide. A positive allowance does not guarantee that operating costs are covered; the full forecast is shown alongside it. Forecasts exclude uncertain match receipts, prizes, future deals and discretionary spending. No financial rates, starting budgets or spending restrictions have changed.

Corrected the finance screen's description that its forecast subtracted wages only: the calculation already included running costs and commercial income. The payroll description now includes paid players awaiting registration and loan wage shares.

Off-season account entries now retain their closing balance and separate wage and running-cost totals, commercial income and number of payrolls. Recent payments no longer attempt to format a missing balance on older off-season entries. Existing careers need no restart.

## Verification
- Shared forecast checked against four actual off-season Monday settlements in both management modes, including facility upkeep, insufficient cash, exact coverage boundaries and older account entries without saved balances.
- Financial-screen and transfer-preview checks use the actual app handlers in a seeded Node VM with DOM/timer stubs. They cover a low-budget Scottish First Division club and Aberdeen's fictional counterpart.
- All five division schedules exercised through 20 simplified season transitions, including explicit Scottish promotion/relegation and corresponding commercial-income changes, valid membership, preserved legacy results and playoff deciders. These are controlled schedule tests, not 20 fully played careers.
- Existing payroll/loan/registration and board-finance regressions pass. Recorded-audio controls and real-engine event reactions still pass: two watched matches, five goal reactions and twelve save reactions.
- Database counts, stadium/kit paths, all root-module syntax and 238 exact offline module URLs pass integrity checks.

83 managed matches and 27 save/backup checkpoints passed across two additional full-season career checks, covering Stranraer in Streamlined mode and Aberdeen in In-depth mode with natural starting budgets, optional transfers/loans/renewals/youth decisions, monthly compressed save and backup checks, and entry into season two. Full career results are recorded separately in review/varied-careers-1.124-final.json. Physical-device listening, Android checks and a real offline upgrade remain outstanding. These checks do not establish balance for every club or an extreme-spending strategy.

The user-confirmed live deployment remains v1.114. This is a prepared build; nothing has been published automatically. Export a career backup before installing. Use the cumulative v1.94-onwards update or the complete ZIP; neither requires earlier update ZIPs.
