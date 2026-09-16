import React from 'react';

export default function LiveStepper({ status }) {
  const isCompleted = (stages) => stages.includes(status);

  const step1Active = ['AI_EXTRACTED_PENDING_VAL', 'PROCESS_VAL_ASSIGNED'].includes(status);
  const step1Done = !step1Active;

  const step2Active = status === 'CUSTOMER_SCOPE_PENDING';
  const step2Done = [
    'AI_VENDOR_SEARCH_PENDING', 'VEND_VAL_AI_ASSIGNED', 'PENDING_VENDOR_QUOTES',
    'QUOTES_RECEIVED_PENDING', 'VEND_VAL_QUOTES_ASSIGNED', 'CUSTOMER_FINAL_SELECTION',
    'CUST_SELECTED_VEND_PENDING', 'VEND_VAL_PO_ASSIGNED', 'PO_SENT_TO_VENDOR',
    'PO_ACCEPTED_VENDOR', 'DISPATCH_REQUESTED', 'LOGISTICS_ACCEPTED', 'PENDING_INSPECTION',
    'PENDING_CUST_DELIVERY_APPROVAL', 'PENDING_LOGISTICS_FEE', 'PENDING_CUST_PAYMENT',
    'PAYMENT_COMPLETED_PENDING_DISPATCH', 'DISPATCHED_TO_CUST'
  ].includes(status);

  const step3Active = status === 'CUSTOMER_FINAL_SELECTION';
  const step3Done = [
    'CUST_SELECTED_VEND_PENDING', 'VEND_VAL_PO_ASSIGNED', 'PO_SENT_TO_VENDOR',
    'PO_ACCEPTED_VENDOR', 'DISPATCH_REQUESTED', 'LOGISTICS_ACCEPTED', 'PENDING_INSPECTION',
    'PENDING_CUST_DELIVERY_APPROVAL', 'PENDING_LOGISTICS_FEE', 'PENDING_CUST_PAYMENT',
    'PAYMENT_COMPLETED_PENDING_DISPATCH', 'DISPATCHED_TO_CUST'
  ].includes(status);

  const step4Active = ['PO_ACCEPTED_VENDOR', 'DISPATCH_REQUESTED', 'LOGISTICS_ACCEPTED', 'PENDING_INSPECTION'].includes(status);
  const step4Done = [
    'PENDING_CUST_DELIVERY_APPROVAL', 'PENDING_LOGISTICS_FEE', 'PENDING_CUST_PAYMENT',
    'PAYMENT_COMPLETED_PENDING_DISPATCH', 'DISPATCHED_TO_CUST'
  ].includes(status);

  const step5Done = status === 'DISPATCHED_TO_CUST';
  const step5Active = ['PENDING_CUST_PAYMENT', 'PAYMENT_COMPLETED_PENDING_DISPATCH'].includes(status);

  return (
    <div className="stepper-container">
      <div className={`step-node ${step1Active ? 'active' : (step1Done ? 'completed' : '')}`}>
        <div className="step-icon">1</div>
        <div className="step-label">AI DFM</div>
      </div>
      <div className={`step-node ${step2Active ? 'active' : (step2Done ? 'completed' : '')}`}>
        <div className="step-icon">2</div>
        <div className="step-label">Scoping</div>
      </div>
      <div className={`step-node ${step3Active ? 'active' : (step3Done ? 'completed' : '')}`}>
        <div className="step-icon">3</div>
        <div className="step-label">Vendor Quote</div>
      </div>
      <div className={`step-node ${step4Active ? 'active' : (step4Done ? 'completed' : '')}`}>
        <div className="step-icon">4</div>
        <div className="step-label">Production &amp; QA</div>
      </div>
      <div className={`step-node ${step5Done ? 'completed' : (step5Active ? 'active' : '')}`}>
        <div className="step-icon">5</div>
        <div className="step-label">Delivered</div>
      </div>
    </div>
  );
}
