
// Mock Supabase client to prevent build errors and runtime crashes
// This allows the app to run without actual Supabase credentials

const mockSelect = () => ({
    data: [],
    error: null,
    eq: () => mockSelect(),
    order: () => Promise.resolve({ data: [], error: null }),
});

const mockInsert = () => Promise.resolve({ data: null, error: null });

export const supabase = {
    from: (table: string) => ({
        select: mockSelect,
        insert: mockInsert,
    }),
    channel: (name: string) => ({
        on: () => ({
            subscribe: () => { },
        }),
    }),
    removeChannel: () => { },
};
