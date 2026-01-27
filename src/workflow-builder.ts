import { randomUUID } from 'crypto';
import type {
  N8nWorkflow,
  N8nNode,
  N8nConnections,
  N8nNodeParameters,
  N8nWorkflowSettings,
} from './types/workflow.js';

export interface NodeConfig {
  name: string;
  type: string;
  parameters?: N8nNodeParameters;
  position?: [number, number];
  typeVersion?: number;
  disabled?: boolean;
  notes?: string;
  credentials?: Record<string, { id: string; name: string }>;
}

export interface ConnectionConfig {
  from: string;
  to: string;
  fromOutput?: number;
  toInput?: number;
  outputType?: string;
}

export class WorkflowBuilder {
  private nodes: Map<string, N8nNode> = new Map();
  private connections: ConnectionConfig[] = [];
  private name: string;
  private settings: N8nWorkflowSettings = {};
  private tags: string[] = [];
  private nodeCounter = 0;
  private currentX = 250;
  private currentY = 300;

  constructor(name: string) {
    this.name = name;
  }

  private generateNodeId(): string {
    return randomUUID();
  }

  private getNextPosition(): [number, number] {
    const position: [number, number] = [this.currentX, this.currentY];
    this.currentX += 250;
    if (this.nodeCounter % 4 === 0 && this.nodeCounter > 0) {
      this.currentX = 250;
      this.currentY += 150;
    }
    this.nodeCounter++;
    return position;
  }

  addNode(config: NodeConfig): WorkflowBuilder {
    const node: N8nNode = {
      id: this.generateNodeId(),
      name: config.name,
      type: config.type,
      typeVersion: config.typeVersion || 1,
      position: config.position || this.getNextPosition(),
      parameters: config.parameters || {},
      disabled: config.disabled,
      notes: config.notes,
      credentials: config.credentials,
    };

    this.nodes.set(config.name, node);
    return this;
  }

  connect(config: ConnectionConfig): WorkflowBuilder {
    this.connections.push({
      from: config.from,
      to: config.to,
      fromOutput: config.fromOutput ?? 0,
      toInput: config.toInput ?? 0,
      outputType: config.outputType ?? 'main',
    });
    return this;
  }

  setSettings(settings: N8nWorkflowSettings): WorkflowBuilder {
    this.settings = { ...this.settings, ...settings };
    return this;
  }

  addTags(...tags: string[]): WorkflowBuilder {
    this.tags.push(...tags);
    return this;
  }

  // Convenience methods for common nodes

  addManualTrigger(name = 'Manual Trigger'): WorkflowBuilder {
    return this.addNode({
      name,
      type: 'n8n-nodes-base.manualTrigger',
      typeVersion: 1,
      parameters: {},
    });
  }

  addWebhookTrigger(
    name = 'Webhook',
    options: { path?: string; method?: string; responseMode?: string } = {}
  ): WorkflowBuilder {
    return this.addNode({
      name,
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      parameters: {
        path: options.path || randomUUID(),
        httpMethod: options.method || 'POST',
        responseMode: options.responseMode || 'onReceived',
        options: {},
      },
    });
  }

  addScheduleTrigger(
    name = 'Schedule Trigger',
    rule: { interval?: string; cronExpression?: string } = {}
  ): WorkflowBuilder {
    const parameters: N8nNodeParameters = {
      rule: {
        interval: [{}],
      },
    };

    if (rule.cronExpression) {
      parameters.rule = {
        interval: [
          {
            field: 'cronExpression',
            expression: rule.cronExpression,
          },
        ],
      };
    }

    return this.addNode({
      name,
      type: 'n8n-nodes-base.scheduleTrigger',
      typeVersion: 1.2,
      parameters,
    });
  }

  addHttpRequest(
    name = 'HTTP Request',
    options: {
      url?: string;
      method?: string;
      authentication?: string;
      body?: unknown;
      headers?: Record<string, string>;
    } = {}
  ): WorkflowBuilder {
    return this.addNode({
      name,
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      parameters: {
        url: options.url || '',
        method: options.method || 'GET',
        authentication: options.authentication || 'none',
        options: {},
      },
    });
  }

  addCode(
    name = 'Code',
    code: string,
    options: { mode?: 'runOnceForAllItems' | 'runOnceForEachItem' } = {}
  ): WorkflowBuilder {
    return this.addNode({
      name,
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      parameters: {
        mode: options.mode || 'runOnceForAllItems',
        jsCode: code,
      },
    });
  }

  addIf(
    name = 'IF',
    conditions: { value1?: string; operation?: string; value2?: string } = {}
  ): WorkflowBuilder {
    return this.addNode({
      name,
      type: 'n8n-nodes-base.if',
      typeVersion: 2,
      parameters: {
        conditions: {
          options: {
            caseSensitive: true,
            leftValue: '',
            typeValidation: 'strict',
          },
          conditions: [
            {
              id: randomUUID(),
              leftValue: conditions.value1 || '',
              rightValue: conditions.value2 || '',
              operator: {
                type: 'string',
                operation: conditions.operation || 'equals',
              },
            },
          ],
          combinator: 'and',
        },
        options: {},
      },
    });
  }

  addSet(
    name = 'Set',
    fields: Array<{ name: string; value: string; type?: string }> = []
  ): WorkflowBuilder {
    return this.addNode({
      name,
      type: 'n8n-nodes-base.set',
      typeVersion: 3.4,
      parameters: {
        mode: 'manual',
        duplicateItem: false,
        assignments: {
          assignments: fields.map((f) => ({
            id: randomUUID(),
            name: f.name,
            value: f.value,
            type: f.type || 'string',
          })),
        },
        options: {},
      },
    });
  }

  addRespondToWebhook(
    name = 'Respond to Webhook',
    options: { responseBody?: unknown; statusCode?: number } = {}
  ): WorkflowBuilder {
    return this.addNode({
      name,
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1.1,
      parameters: {
        respondWith: 'json',
        responseBody: JSON.stringify(options.responseBody || { success: true }),
        options: {
          responseCode: options.statusCode || 200,
        },
      },
    });
  }

  addSlack(
    name = 'Slack',
    options: {
      channel?: string;
      text?: string;
      operation?: string;
    } = {}
  ): WorkflowBuilder {
    return this.addNode({
      name,
      type: 'n8n-nodes-base.slack',
      typeVersion: 2.2,
      parameters: {
        resource: 'message',
        operation: options.operation || 'post',
        channel: {
          __rl: true,
          mode: 'name',
          value: options.channel || '',
        },
        text: options.text || '',
        otherOptions: {},
      },
    });
  }

  addNoOp(name = 'No Operation'): WorkflowBuilder {
    return this.addNode({
      name,
      type: 'n8n-nodes-base.noOp',
      typeVersion: 1,
      parameters: {},
    });
  }

  build(): N8nWorkflow {
    const nodesArray = Array.from(this.nodes.values());
    const connections: N8nConnections = {};

    for (const conn of this.connections) {
      const fromNode = this.nodes.get(conn.from);
      const toNode = this.nodes.get(conn.to);

      if (!fromNode || !toNode) {
        throw new Error(
          `Invalid connection: ${conn.from} -> ${conn.to}. Node not found.`
        );
      }

      if (!connections[conn.from]) {
        connections[conn.from] = {};
      }

      const outputType = conn.outputType || 'main';
      if (!connections[conn.from][outputType]) {
        connections[conn.from][outputType] = [];
      }

      const outputIndex = conn.fromOutput ?? 0;
      while (connections[conn.from][outputType].length <= outputIndex) {
        connections[conn.from][outputType].push([]);
      }

      connections[conn.from][outputType][outputIndex].push({
        node: conn.to,
        type: 'main',
        index: conn.toInput ?? 0,
      });
    }

    return {
      name: this.name,
      nodes: nodesArray,
      connections,
      active: false,
      settings: this.settings,
      tags: this.tags,
    };
  }
}

export function createWorkflow(name: string): WorkflowBuilder {
  return new WorkflowBuilder(name);
}
