#[starknet::contract]
mod GameContract {
    use starknet::get_caller_address;
    use starknet::ContractAddress;

    #[storage]
    struct Storage {
        // Track if player has defeated Eldrakor
        defeated_eldrakor: LegacyMap::<ContractAddress, bool>,
        // Track number of victories per player
        victory_count: LegacyMap::<ContractAddress, u32>,
        // Track best completion time (in seconds)
        best_time: LegacyMap::<ContractAddress, u64>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        BossDefeated: BossDefeated,
        NewBestTime: NewBestTime,
    }

    #[derive(Drop, starknet::Event)]
    struct BossDefeated {
        player: ContractAddress,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct NewBestTime {
        player: ContractAddress,
        time: u64,
    }

    #[external(v0)]
    impl GameContract of super::IGameContract {
        // Record a victory against Eldrakor
        fn record_victory(self: @ContractAddress, completion_time: u64) {
            let player = get_caller_address();
            
            // Mark Eldrakor as defeated for this player
            self.defeated_eldrakor.write(player, true);
            
            // Increment victory count
            let current_victories = self.victory_count.read(player);
            self.victory_count.write(player, current_victories + 1);
            
            // Update best time if applicable
            let current_best = self.best_time.read(player);
            if current_best == 0 || completion_time < current_best {
                self.best_time.write(player, completion_time);
                self.emit(NewBestTime { player, time: completion_time });
            }
            
            // Emit victory event
            self.emit(BossDefeated { 
                player,
                timestamp: starknet::get_block_timestamp(),
            });
        }

        // Check if player has defeated Eldrakor
        fn has_defeated_eldrakor(self: @ContractAddress, player: ContractAddress) -> bool {
            self.defeated_eldrakor.read(player)
        }

        // Get player's victory count
        fn get_victory_count(self: @ContractAddress, player: ContractAddress) -> u32 {
            self.victory_count.read(player)
        }

        // Get player's best completion time
        fn get_best_time(self: @ContractAddress, player: ContractAddress) -> u64 {
            self.best_time.read(player)
        }
    }
}

#[starknet::interface]
trait IGameContract {
    fn record_victory(self: @ContractAddress, completion_time: u64);
    fn has_defeated_eldrakor(self: @ContractAddress, player: ContractAddress) -> bool;
    fn get_victory_count(self: @ContractAddress, player: ContractAddress) -> u32;
    fn get_best_time(self: @ContractAddress, player: ContractAddress) -> u64;
}