var _ = require('lodash');
var fs = require('fs');

var Parser = require('../../../../lib/adapter/cmof/Parser');
var Helper = require('../../Helper'),
    log = Helper.log;

describe('import CMOF', function() {

  beforeEach(Helper.initAdditionalMatchers);

  function parsed(file, callback) {
    return function(done) {
      new Parser({ clean: true }).parseFile(file, function(err, results) {
        if (err) {
          done(err);
        } else {
          try {
            callback(results);
            done();
          } catch (e) {
            done(e);
          }
        }
      });
    };
  }

  it('should attach prefix to package', parsed('test/fixtures/cmof/BPMN20.cmof', function(results) {

    var elementsById = results.byId;

    var pkg = elementsById['_0'];
    expect(pkg.prefix).toEqual('bpmn');
  }));

  it('should contain bpmn:SubProcess (properties, inheritance, isMany)', parsed('test/fixtures/cmof/BPMN20.cmof', function(results) {

    var elementsById = results.byId;

    var subProcess = elementsById['SubProcess'];

    var expected = {
      id: 'SubProcess',
      name: 'SubProcess',
      superClass: [ 'Activity', 'FlowElementsContainer' ],
      properties:
       [ { id: 'SubProcess-triggeredByEvent',
           name: 'triggeredByEvent',
           isAttr: true,
           default: false,
           type: 'Boolean' },
         { name: 'artifacts',
           id: 'SubProcess-artifacts',
           type: 'Artifact',
           isMany: true,
           association: 'A_artifacts_subProcess' } ]
    };

    expect(subProcess).toDeepEqual(expected);
  }));

  it('should contain bpmn:ChoreographyLoopType (literal values)', parsed('test/fixtures/cmof/BPMN20.cmof', function(results) {
    var elementsById = results.byId;

    var loopType = elementsById['ChoreographyLoopType'];

    var expected = {
      "name": "ChoreographyLoopType",
      "id": "ChoreographyLoopType",
      "literalValues": [
        { "name": "None", "id": "ChoreographyLoopType-None" },
        { "name": "Standard", "id": "ChoreographyLoopType-Standard" },
        { "name": "MultiInstanceSequential", "id": "ChoreographyLoopType-MultiInstanceSequential" },
        { "name": "MultiInstanceParallel", "id": "ChoreographyLoopType-MultiInstanceParallel" }
      ]
    };

    expect(loopType).toDeepEqual(expected);
  }));

  it('should contain bpmn:SequenceFlow (complex-attr-reference)', parsed('test/fixtures/cmof/BPMN20.cmof', function(results) {
    var elementsById = results.byId;

    var shape = elementsById['SequenceFlow'];

    var expected = {
      name : 'SequenceFlow',
      superClass : [ 'FlowElement' ],
      id : 'SequenceFlow',
      properties : [
        { name : 'isImmediate', id : 'SequenceFlow-isImmediate', isAttr : true, type : 'Boolean' },
        { name : 'conditionExpression', type : 'Expression', association : 'A_conditionExpression_sequenceFlow', id : 'SequenceFlow-conditionExpression' },
        { name : 'sourceRef', type : 'FlowNode', association : 'A_sourceRef_outgoing_flow', id : 'SequenceFlow-sourceRef', isAttr : true, isReference : true },
        { name : 'targetRef', type : 'FlowNode', association : 'A_targetRef_incoming_flow', id : 'SequenceFlow-targetRef', isAttr : true, isReference : true }
      ]
    };

    expect(shape).toDeepEqual(expected);
  }));

  it('should contain bpmn:FlowElement (complex-contain-reference)', parsed('test/fixtures/cmof/BPMN20.cmof', function(results) {
    var elementsById = results.byId;

    var flowNode = elementsById['FlowNode'];

    var expected = {
      name : 'FlowNode',
      isAbstract : true,
      superClass : [ 'FlowElement' ],
      id : 'FlowNode',
      properties : [
        { name : 'outgoing', type : 'SequenceFlow', association : 'A_sourceRef_outgoing_flow', id : 'FlowNode-outgoing', isMany : true, isReference : true },
        { name : 'incoming', type : 'SequenceFlow', association : 'A_targetRef_incoming_flow', id : 'FlowNode-incoming', isMany : true, isReference : true },
        { name : 'lanes', type : 'Lane', association : 'A_flowNodeRefs_lanes', id : 'FlowNode-lanes', isVirtual : true, isMany : true, isReference : true }
      ]
    };

    expect(flowNode).toDeepEqual(expected);
  }));

  it('should contain bpmndi:BPMNShape (complex-contain-reference)', parsed('test/fixtures/cmof/BPMNDI.cmof', function(results) {
    var elementsById = results.byId;

    var flowNode = elementsById['BPMNShape'];

    var expected = {
      name : 'BPMNShape',
      superClass : [ 'di:LabeledShape' ],
      id : 'BPMNShape',
      properties : [
        { name : 'bpmnElement', association : 'A_bpmnElement_shape', id : 'BPMNShape-bpmnElement', isAttr : true, isReference : true, type : 'bpmn:BaseElement', redefines: 'di:DiagramElement#modelElement' },
        { name : 'isHorizontal', id : 'BPMNShape-isHorizontal', isAttr : true, type: 'Boolean' },
        { name : 'isExpanded', id : 'BPMNShape-isExpanded', isAttr : true, type : 'Boolean' },
        { name : 'isMarkerVisible', id : 'BPMNShape-isMarkerVisible', isAttr : true, type : 'Boolean' },
        { name : 'label', type : 'BPMNLabel', association : 'A_label_shape', id : 'BPMNShape-label' },
        { name : 'isMessageVisible', id : 'BPMNShape-isMessageVisible', isAttr : true, type : 'Boolean' },
        { name : 'participantBandKind', type : 'ParticipantBandKind', id : 'BPMNShape-participantBandKind', isAttr : true },
        { name : 'choreographyActivityShape', type : 'BPMNShape', association : 'A_choreographyActivityShape_participantBandShape', id : 'BPMNShape-choreographyActivityShape', isAttr : true, isReference : true }
      ]
    };

    expect(flowNode).toDeepEqual(expected);
  }));

  it('should contain di:Shape (complex-non-attr-type)', parsed('test/fixtures/cmof/DI.cmof', function(results) {
    var elementsById = results.byId;

    var shape = elementsById['Shape'];

    var expected = {
      name : 'Shape',
      isAbstract : true,
      superClass : [ 'Node' ],
      id : 'Shape',
      properties : [
        { name : 'bounds', id : 'Shape-bounds', type : 'dc:Bounds' }
      ]
    };

    expect(shape).toDeepEqual(expected);
  }));
});