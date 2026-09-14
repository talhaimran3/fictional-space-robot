//fictional-space-robot/multi-tenant-saas/frontend/src/admin/components/developerDatabase/DatabaseTableNode.jsx
import {
  Handle,
  Position,
} from "reactflow";

import "./DatabaseTableNode.css";

const DatabaseTableNode = ({
  data,
}) => {
  return (
    <div className="database-node">
      {/* HEADER */}

      <div className="database-node-header">
        <div className="database-node-title">
          <div className="database-node-icon">
            ▦
          </div>

          <div>
            <strong>
              {data.name}
            </strong>

            <span>
              {data.columns.length} columns
            </span>
          </div>
        </div>

        <span
          className={`database-rls ${
            data.rls
              ? "database-rls-on"
              : "database-rls-off"
          }`}
        >
          RLS {data.rls ? "ON" : "OFF"}
        </span>
      </div>

      {/* COLUMNS */}

      <div className="database-columns">
        {data.columns.map((column) => (
          <div
            className="database-column"
            key={column.name}
          >
            {/* TARGET */}

            <Handle
              type="target"
              position={Position.Left}
              id={`${column.name}-target`}
              className="database-handle"
            />

            <div className="database-column-key">
              {column.key === "PK"
                ? "PK"
                : column.key === "FK"
                ? "FK"
                : "·"}
            </div>

            <div className="database-column-name">
              {column.name}
            </div>

            <div className="database-column-type">
              {column.type}
            </div>

            {/* SOURCE */}

            <Handle
              type="source"
              position={Position.Right}
              id={`${column.name}-source`}
              className="database-handle"
            />
          </div>
        ))}
      </div>

      {/* POLICY */}

      <div className="database-policy">
        <span>🛡</span>

        <span>
          {data.policies?.length
            ? `${data.policies.length} policies`
            : "No policies loaded"}
        </span>
      </div>
    </div>
  );
};

export default DatabaseTableNode;