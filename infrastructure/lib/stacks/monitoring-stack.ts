import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions';
import { MonitoringStackProps } from '../types';

export class MonitoringStack extends Stack {
  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);

    // SNS Topic for alerts
    const alertTopic = new sns.Topic(this, 'AlertTopic', {
      topicName: `${props.projectName}-alerts-${props.stage}`,
      displayName: `Career.fm Alerts - ${props.stage}`,
    });

    // Add email subscription (replace with actual email)
    if (props.stage === 'prod') {
      alertTopic.addSubscription(
        new snsSubscriptions.EmailSubscription('admin@career.fm')
      );
    }

    // API Gateway Metrics
    this.createApiMetrics(props, alertTopic);

    // DynamoDB Metrics
    this.createDynamoDbMetrics(props, alertTopic);

    // Custom Dashboard
    this.createDashboard(props);

    // Cost Alarms
    this.createCostAlarms(props, alertTopic);
  }

  private createApiMetrics(props: MonitoringStackProps, alertTopic: sns.ITopic) {
    // API Error Rate Alarm
    const apiErrorMetric = new cloudwatch.Metric({
      namespace: 'AWS/ApiGateway',
      metricName: '4XXError',
      dimensionsMap: {
        ApiName: props.api.restApiName,
        Stage: props.stage,
      },
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    new cloudwatch.Alarm(this, 'ApiErrorAlarm', {
      metric: apiErrorMetric,
      threshold: 10,
      evaluationPeriods: 2,
      alarmDescription: 'API error rate is too high',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cloudwatchActions.SnsAction(alertTopic));

    // API Latency Alarm
    const apiLatencyMetric = new cloudwatch.Metric({
      namespace: 'AWS/ApiGateway',
      metricName: 'Latency',
      dimensionsMap: {
        ApiName: props.api.restApiName,
        Stage: props.stage,
      },
      statistic: 'Average',
      period: cdk.Duration.minutes(5),
    });

    new cloudwatch.Alarm(this, 'ApiLatencyAlarm', {
      metric: apiLatencyMetric,
      threshold: 3000, // 3 seconds
      evaluationPeriods: 2,
      alarmDescription: 'API latency is too high',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cloudwatchActions.SnsAction(alertTopic));
  }

  private createDynamoDbMetrics(props: MonitoringStackProps, alertTopic: sns.ITopic) {
    // DynamoDB Throttled Requests
    const throttledRequestsMetric = new cloudwatch.Metric({
      namespace: 'AWS/DynamoDB',
      metricName: 'SystemErrors',
      dimensionsMap: {
        TableName: props.audioCardTable.tableName,
      },
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    new cloudwatch.Alarm(this, 'DynamoDbThrottleAlarm', {
      metric: throttledRequestsMetric,
      threshold: 5,
      evaluationPeriods: 1,
      alarmDescription: 'DynamoDB throttling detected',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cloudwatchActions.SnsAction(alertTopic));
  }

  private createDashboard(props: MonitoringStackProps) {
    const dashboard = new cloudwatch.Dashboard(this, 'Dashboard', {
      dashboardName: `${props.projectName}-${props.stage}`,
      defaultInterval: cdk.Duration.hours(1),
    });

    // API Metrics Widget
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'API Gateway Metrics',
        left: [
          new cloudwatch.Metric({
            namespace: 'AWS/ApiGateway',
            metricName: 'Count',
            dimensionsMap: {
              ApiName: props.api.restApiName,
              Stage: props.stage,
            },
            statistic: 'Sum',
          }),
        ],
        right: [
          new cloudwatch.Metric({
            namespace: 'AWS/ApiGateway',
            metricName: 'Latency',
            dimensionsMap: {
              ApiName: props.api.restApiName,
              Stage: props.stage,
            },
            statistic: 'Average',
          }),
        ],
        width: 12,
        height: 6,
      })
    );

    // Error Rate Widget
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'API Error Rate',
        left: [
          new cloudwatch.Metric({
            namespace: 'AWS/ApiGateway',
            metricName: '4XXError',
            dimensionsMap: {
              ApiName: props.api.restApiName,
              Stage: props.stage,
            },
            statistic: 'Sum',
            color: cloudwatch.Color.ORANGE,
          }),
          new cloudwatch.Metric({
            namespace: 'AWS/ApiGateway',
            metricName: '5XXError',
            dimensionsMap: {
              ApiName: props.api.restApiName,
              Stage: props.stage,
            },
            statistic: 'Sum',
            color: cloudwatch.Color.RED,
          }),
        ],
        width: 12,
        height: 6,
      })
    );

    // DynamoDB Metrics Widget
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'DynamoDB Performance',
        left: [
          new cloudwatch.Metric({
            namespace: 'AWS/DynamoDB',
            metricName: 'ConsumedReadCapacityUnits',
            dimensionsMap: {
              TableName: props.audioCardTable.tableName,
            },
            statistic: 'Sum',
          }),
          new cloudwatch.Metric({
            namespace: 'AWS/DynamoDB',
            metricName: 'ConsumedWriteCapacityUnits',
            dimensionsMap: {
              TableName: props.audioCardTable.tableName,
            },
            statistic: 'Sum',
          }),
        ],
        width: 12,
        height: 6,
      })
    );
  }

  private createCostAlarms(props: MonitoringStackProps, alertTopic: sns.ITopic) {
    // Monthly cost alarm
    const costMetric = new cloudwatch.Metric({
      namespace: 'AWS/Billing',
      metricName: 'EstimatedCharges',
      dimensionsMap: {
        Currency: 'USD',
      },
      statistic: 'Maximum',
      period: cdk.Duration.hours(6),
      region: 'us-east-1', // Billing metrics are only in us-east-1
    });

    new cloudwatch.Alarm(this, 'MonthlyCostAlarm', {
      metric: costMetric,
      threshold: props.stage === 'prod' ? 100 : 50,
      evaluationPeriods: 1,
      alarmDescription: `Monthly cost exceeds ${props.stage === 'prod' ? '$100' : '$50'}`,
      treatMissingData: cloudwatch.TreatMissingData.BREACHING,
    }).addAlarmAction(new cloudwatchActions.SnsAction(alertTopic));
  }
}