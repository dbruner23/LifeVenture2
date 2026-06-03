import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as budgets from 'aws-cdk-lib/aws-budgets';

interface CostStackProps extends StackProps {
  /** Email that receives all budget alerts. */
  alertEmail: string;
  /** Monthly USD budget. Defaults to 5. */
  monthlyBudgetUsd?: number;
}

/**
 * Day-zero tripwire. Sends email alerts when actual cost crosses 50/80/100% of
 * the monthly budget, and again if AWS's forecast for the month projects 100%.
 * AWS Budgets is a global service; the stack region doesn't affect the alert.
 */
export class CostStack extends Stack {
  constructor(scope: Construct, id: string, props: CostStackProps) {
    super(scope, id, props);

    const amount = props.monthlyBudgetUsd ?? 5;
    const subscriber: budgets.CfnBudget.SubscriberProperty = {
      subscriptionType: 'EMAIL',
      address: props.alertEmail,
    };

    const threshold = (percent: number, type: 'ACTUAL' | 'FORECASTED') => ({
      notification: {
        comparisonOperator: 'GREATER_THAN',
        notificationType: type,
        threshold: percent,
        thresholdType: 'PERCENTAGE',
      },
      subscribers: [subscriber],
    });

    new budgets.CfnBudget(this, 'MonthlyBudget', {
      budget: {
        budgetName: 'LifeVenture-monthly',
        budgetType: 'COST',
        timeUnit: 'MONTHLY',
        budgetLimit: { amount, unit: 'USD' },
      },
      notificationsWithSubscribers: [
        threshold(50, 'ACTUAL'),
        threshold(80, 'ACTUAL'),
        threshold(100, 'ACTUAL'),
        threshold(100, 'FORECASTED'),
      ],
    });
  }
}
