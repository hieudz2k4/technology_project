import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { CompositePropagator, W3CTraceContextPropagator } from '@opentelemetry/core';
import { B3Propagator, B3InjectEncoding } from '@opentelemetry/propagator-b3';
import * as api from '@opentelemetry/api';

const traceExporter = new OTLPTraceExporter({
    url: 'http://localhost:4318/v1/traces',
});

// Configure propagation to support both B3 (Zipkin/Brave) and W3C
// B3 Multi-header is safer for Brave compatibility
api.propagation.setGlobalPropagator(
    new CompositePropagator({
        propagators: [
            new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER }),
            new W3CTraceContextPropagator(),
        ],
    }),
);

export const otelSDK = new NodeSDK({
    resource: resourceFromAttributes({
        [SemanticResourceAttributes.SERVICE_NAME]: 'transfer_service',
    }),
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
});

// Gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
    otelSDK
        .shutdown()
        .then(
            () => console.log('SDK shut down successfully'),
            (err) => console.log('Error shutting down SDK', err),
        )
        .finally(() => process.exit(0));
});
