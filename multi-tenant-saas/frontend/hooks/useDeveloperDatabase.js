import {
    useCallback,
    useEffect,
    useState,
} from "react";
import { getDeveloperDatabaseSchema } from "../api/developerDatabaseApi";


export const useDeveloperDatabase = () => {
    const [tables, setTables] = useState([]);
    const [relationships, setRelationships] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState(null);

    const fetchSchema = useCallback(
        async () => {
            try {
                setLoading(true);
                setError(null);

                const response =
                    await getDeveloperDatabaseSchema();

                if (!response?.success) {
                    throw new Error(
                        response?.message ||
                        "Failed to load database schema."
                    );
                }

                setTables(
                    response.data?.tables || []
                );

                setRelationships(
                    response.data?.relationships || []
                );
            } catch (err) {
                console.error(
                    "Database schema fetch error:",
                    err
                );

                setError(
                    err.message ||
                    "Failed to load database schema."
                );
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchSchema();
    }, [fetchSchema]);

    return {
        tables,
        relationships,
        loading,
        error,
        refresh: fetchSchema,
    };
};