#[macro_export]
macro_rules! set {
    ($world:expr, ($($model:expr),*)) => {
        $( $world.set_model($model); )*
    };
}

#[macro_export]
macro_rules! get {
    ($world:expr, $player:expr, ($($model:ty),*)) => {
        (
            $( $world.get_model::<$model>($player), )*
        )
    };
}

#[macro_export]
macro_rules! emit {
    ($world:expr, $event:expr) => {
        $world.emit($event)
    };
} 