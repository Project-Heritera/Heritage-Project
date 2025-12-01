const SectionsHolder = ({ children }) => {
    return (
        <div className="w-full">
            {/* 2. Just a transparent container for spacing */}
            <div className="flex flex-col gap-4">
                {children}
            </div>
        </div>
    );
};

export default SectionsHolder;