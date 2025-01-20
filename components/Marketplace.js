import React from 'react';

export default function Marketplace() {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-30">
            {/* Semi-transparent overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50" />
            
            {/* Shop Items Layer */}
            <div className="relative z-40">
                <img 
                    src="/notif/shopitems.png"
                    alt="Shop Items"
                    className="max-w-[80%] h-auto"
                />
            </div>
        </div>
    );
}
