const calculateBalance = (expenses, userId) => {
    let balance = 0;

    for (let expense of expenses) {
        const paidByUser = expense.paidBy._id.toString() === userId.toString();

        if (paidByUser) {
            for (let split of expense.splitBetween) {
                if (split.user._id.toString() !== userId.toString() && !split.isPaid) {
                    balance += split.amount;
                }
            }
        } else {
            const userSplit = expense.splitBetween.find(
                split => split.user._id.toString() === userId.toString()
            );

            if (userSplit && !userSplit.isPaid) {
                balance -= userSplit.amount;
            }
        }   
    }
    return balance;
};

const optimizeSettlements = (balances) => {
    const settlements = [];
    const debtors = [];
    const creditors = [];

    for (let userId in balances) {
        if (balances[userId] < 0) {
            debtors.push({ userId, amount: Math.abs(balances[userId]) });
        } else if (balances[userId] > 0) {
            creditors.push({ userId, amount: balances[userId] });
        }
    }

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        const settleAmount = Math.min(debtor.amount, creditor.amount);

        settlements.push({
            from: debtor.userId,
            to: creditor.userId,
            amount: settleAmount
        });

        debtor.amount -= settleAmount;
        creditor.amount -= settleAmount;

        if (debtor.amount === 0) {
            i++;
        }
        if (creditor.amount === 0) {
            j++;
        }
    }
    return settlements;
};

const getGroupSettlements = async (expenses, members) => {
    const balances = {};

    for (let member of members) {
        balances[member.user._id.toString()] = 0;
    }
    for (let expense of expenses) {
        const paidById = expense.paidBy._id.toString();

        for (let split of expense.splitBetween) {
            const userId = split.user._id.toString();

            if (!split.isPaid) {
                if (userId === paidById) {
                    continue;
                }
                balances[paidById] += split.amount;
                balances[userId] -= split.amount;
            }
        }
    }

    const optimizedSettlements = optimizeSettlements(balances);

    const settlementsWithNames = optimizedSettlements.map(settlement => {
        const fromMember = members.find(
            m => m.user._id.toString() === settlement.from
        );
        const toMember = members.find(
            m => m.user._id.toString() === settlement.to
        );

        return {
            from: {
                id: settlement.from,
                name: fromMember.user.name,
                email: fromMember.user.email
            },
            to: {
                id: settlement.to,
                name: toMember.user.name,
                email: toMember.user.email
            },
            amount: settlement.amount
        };
    });

    return {
        balances,
        settlements: settlementsWithNames
    };
};

module.exports = {
    calculateBalance,
    optimizeSettlements,
    getGroupSettlements
};