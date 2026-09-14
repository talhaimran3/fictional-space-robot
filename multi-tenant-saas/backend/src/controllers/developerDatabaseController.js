// fictional-space-robot/multi-tenant-saas/backend/src/controllers/developerDatabaseController.jsimport db from "../config/db.js";

/*
 * Developer Database Controller
 *
 * READ-ONLY for now.
 *
 * This controller reads PostgreSQL metadata and converts it
 * into a format that the React Flow frontend can understand.
 */
import db from "../config/database.js";

export const getDatabaseSchema = async (req, res) => {
  try {
    /*
     * Get tables
     */
    const tablesResult = await db.query(`
      SELECT
        table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    /*
     * Get columns
     */
    const columnsResult = await db.query(`
      SELECT
        c.table_name,
        c.column_name,
        c.data_type,
        c.udt_name,
        c.ordinal_position,
        CASE
          WHEN tc.constraint_type = 'PRIMARY KEY'
          THEN 'PK'
          WHEN tc.constraint_type = 'FOREIGN KEY'
          THEN 'FK'
          ELSE NULL
        END AS key_type
      FROM information_schema.columns c

      LEFT JOIN information_schema.key_column_usage kcu
        ON c.table_schema = kcu.table_schema
        AND c.table_name = kcu.table_name
        AND c.column_name = kcu.column_name

      LEFT JOIN information_schema.table_constraints tc
        ON kcu.constraint_name = tc.constraint_name
        AND kcu.table_schema = tc.table_schema
        AND kcu.table_name = tc.table_name

      WHERE c.table_schema = 'public'

      ORDER BY
        c.table_name,
        c.ordinal_position;
    `);

    /*
     * Get foreign keys
     */
    const foreignKeysResult = await db.query(`
      SELECT
        tc.constraint_name,
        tc.table_name AS source_table,
        kcu.column_name AS source_column,
        ccu.table_name AS target_table,
        ccu.column_name AS target_column
      FROM information_schema.table_constraints AS tc

      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema

      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema

      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'

      ORDER BY tc.table_name;
    `);

    /*
     * Build table objects
     */
    const tables = tablesResult.rows.map((table) => {
      const columns = columnsResult.rows
        .filter(
          (column) =>
            column.table_name === table.table_name
        )
        .map((column) => ({
          name: column.column_name,
          type: column.udt_name || column.data_type,
          key: column.key_type,
        }));

      return {
        id: table.table_name,
        name: table.table_name,

        /*
         * We are not changing RLS here.
         * This is simply metadata for the UI.
         */
        rls: false,

        policies: [],

        columns,
      };
    });

    /*
     * Convert FK metadata into React Flow edges
     */
    const relationships = foreignKeysResult.rows.map(
      (relationship) => ({
        id: relationship.constraint_name,

        fromTable: relationship.source_table,
        fromCol: relationship.source_column,

        toTable: relationship.target_table,
        toCol: relationship.target_column,

        constraintName:
          relationship.constraint_name,
      })
    );

    res.json({
      success: true,

      data: {
        tables,
        relationships,
      },
    });
  } catch (error) {
    console.error(
      "Developer database schema error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load database schema.",
    });
  }
};
export const getTableData = async (req, res) => {
  try {
    // Replace 'your_table_name' with your actual SQL table
    const queryText = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name ASC;
    `;

    const result = await db.query(queryText);
    // Return data to frontend
    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve data from the database.'
    });
  }
};
export const getSingleTableData = async (req, res) => {
  const { tableName } = req.params;
  try {
    // 1. Get valid tables first to strictly validate user input
    const tableCheck = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);

    const validTables = tableCheck.rows.map(row => row.table_name);
    // convert it to object from array of objects
    
   
    console.log('requested table = ', tableName)
    // 2. Security validation check
    if (!validTables.includes(tableName)) {
      return res.status(400).json({
        success: false,
        message: `Invalid or unauthorized table name: ${tableName}`
      });
    }

    // 3. Dynamically inject verified, clean table identifier safely into query string
    const dataResult = await db.query(`SELECT * FROM ${tableName}`);
    return res.status(200).json({
      success: true,
      tableName: tableName,
      rows: dataResult.rows,
      // If table is empty, extract schema columns from the field metadata array
      columns: dataResult.fields.map(field => field.name)
    });

  } catch (error) {
    console.error('Neon DB Query Error:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to retrieve data for table ${tableName}.`
    });
  }
};
