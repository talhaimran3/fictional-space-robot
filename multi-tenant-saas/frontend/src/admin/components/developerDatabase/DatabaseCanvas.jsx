//fictional-space-robot/multi-tenant-saas/frontend/src/admin/components/developerDatabase/DatabaseCanvas.jsx
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  useEdgesState,
  useNodesState,
} from "reactflow";

import "reactflow/dist/style.css";

import DatabaseTableNode from "./DatabaseTableNode.jsx";
import "./DatabaseCanvas.css";

const nodeTypes = {
  databaseTable: DatabaseTableNode,
};

const INITIAL_POSITIONS = {
  organizations: {
    x: 80,
    y: 180,
  },

  organization_members: {
    x: 480,
    y: 80,
  },

  users: {
    x: 880,
    y: 180,
  },

  shifts: {
    x: 480,
    y: 430,
  },
};

const createNodes = (tables = []) => {
  return tables.map((table) => {
    const position =
      INITIAL_POSITIONS[table.id] || {
        x: 100,
        y: 100,
      };

    return {
      id: table.id,

      type: "databaseTable",

      position,

      data: table,
    };
  });
};

const createEdges = (relationships = []) => {
  return relationships.map((relationship) => ({
    id: relationship.id,

    source: relationship.fromTable,

    sourceHandle:
      `${relationship.fromCol}-source`,

    target: relationship.toTable,

    targetHandle:
      `${relationship.toCol}-target`,

    type: "smoothstep",

    label: relationship.constraintName,

    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#64748b",
    },

    style: {
      stroke: "#64748b",
      strokeWidth: 2,
    },

    labelStyle: {
      fill: "#94a3b8",
      fontSize: 8,
    },

    labelBgStyle: {
      fill: "#0f172a",
    },
  }));
};

const DatabaseCanvas = ({
  tables = [],
  relationships = [],
}) => {
  const initialNodes = useMemo(
    () => createNodes(tables),
    [tables]
  );

  const initialEdges = useMemo(
    () => createEdges(relationships),
    [relationships]
  );

  const [
    nodes,
    setNodes,
    onNodesChange,
  ] = useNodesState(initialNodes);

  const [
    edges,
    setEdges,
    onEdgesChange,
  ] = useEdgesState(initialEdges);

  const [selectedTable, setSelectedTable] =
    useState(null);

  const [
    showRelationships,
    setShowRelationships,
  ] = useState(true);

  /*
   * Update React Flow when backend data changes.
   */
  useEffect(() => {
    setNodes(createNodes(tables));
    setEdges(createEdges(relationships));
  }, [
    tables,
    relationships,
    setNodes,
    setEdges,
  ]);

  /*
   * Highlight connected tables.
   */
  const displayNodes = useMemo(() => {
    if (!selectedTable) {
      return nodes;
    }

    return nodes.map((node) => {
      if (node.id === selectedTable) {
        return node;
      }

      const connected = edges.some(
        (edge) =>
          (edge.source === selectedTable &&
            edge.target === node.id) ||
          (edge.target === selectedTable &&
            edge.source === node.id)
      );

      return {
        ...node,

        style: {
          opacity: connected ? 1 : 0.2,

          transition:
            "opacity 180ms ease",
        },
      };
    });
  }, [
    nodes,
    edges,
    selectedTable,
  ]);

  /*
   * Select table.
   */
  const handleNodeClick = useCallback(
    (_, node) => {
      setSelectedTable(node.id);
    },
    []
  );

  return (
    <div className="database-canvas">

      {/* HEADER */}

      <div className="database-canvas-header">
        <div className="database-canvas-title">
          <strong>
            Database Schema
          </strong>

          <span>
            Visual relationship map
          </span>
        </div>

        <div className="database-canvas-actions">

          <button
            type="button"
            onClick={() =>
              setShowRelationships(
                (value) => !value
              )
            }
          >
            {showRelationships
              ? "Hide relationships"
              : "Show relationships"}
          </button>

          <button
            type="button"
            onClick={() =>
              setSelectedTable(null)
            }
          >
            Clear focus
          </button>

        </div>
      </div>

      {/* REACT FLOW */}

      <div className="database-flow-wrapper">

        <ReactFlow
          nodes={displayNodes}
          edges={
            showRelationships
              ? edges
              : []
          }
          onNodesChange={
            onNodesChange
          }
          onEdgesChange={
            onEdgesChange
          }
          onNodeClick={
            handleNodeClick
          }
          onPaneClick={() =>
            setSelectedTable(null)
          }
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: 0.2,
          }}
          proOptions={{
            hideAttribution: true,
          }}
        >

          <Background
            gap={24}
            size={1}
          />

          <Controls />

          <MiniMap
            nodeColor="#2563eb"
            maskColor="rgba(8,14,25,.75)"
          />

        </ReactFlow>

      </div>

      {/* INFORMATION */}

      <div className="database-canvas-info">

        <strong>
          {tables.length} tables
        </strong>

        <span>
          {relationships.length} relationships
        </span>

      </div>

    </div>
  );
};

export default DatabaseCanvas;